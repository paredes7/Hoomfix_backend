import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

interface GoogleTokenInfo {
  sub: string;
  email: string;
  email_verified: string;
  given_name?: string;
  family_name?: string;
}
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private static readonly RESET_CODE_TTL_MS = 15 * 60 * 1000;
  private static readonly RESET_MAX_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  // ─── HELPERS DE USERNAME ─────────────────────────────────────────────────────

  private buildUsernameBase(source: string): string {
    return source
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  private async generateUsername(emailOrPhone: string): Promise<string> {
    const base = this.buildUsernameBase(emailOrPhone);
    let username = base;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${base}${counter}`;
      counter++;
    }
    return username;
  }

  private async generateUsernameSuggestions(base: string): Promise<string[]> {
    const candidates = [`${base}1`, `${base}2`, `${base}_ok`];
    const results: string[] = [];
    for (const candidate of candidates) {
      const exists = await this.prisma.user.findUnique({
        where: { username: candidate },
      });
      if (!exists) results.push(candidate);
    }
    return results;
  }

  // ─── REGISTRO ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'Debes proporcionar un email o un teléfono',
      );
    }

    const email = dto.email?.trim().toLowerCase();
    const phone = dto.phone?.trim();
    const username = dto.username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const countryIso = dto.countryIso.trim().toUpperCase();

    if (email) {
      const exists = await this.prisma.user.findUnique({ where: { email } });
      if (exists) throw new ConflictException('El email ya está registrado');
    }

    if (phone) {
      const exists = await this.prisma.user.findUnique({ where: { phone } });
      if (exists) throw new ConflictException('El teléfono ya está registrado');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      const suggestions = await this.generateUsernameSuggestions(username);
      throw new ConflictException({
        message: 'El username ya está en uso',
        suggestions,
      });
    }

    const country = await this.prisma.country.findUnique({
      where: { iso: countryIso },
    });
    if (!country)
      throw new BadRequestException('El país seleccionado no existe');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email: email ?? null,
          phone: phone ?? null,
          username,
          password: hashedPassword,
          profile: {
            create: {
              countryIso,
              wallet: {
                create: {
                  currency: country.currency,
                  balance: 0,
                },
              },
            },
          },
        },
        include: {
          profile: {
            include: { wallet: true },
          },
        },
      });
    });

    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { phone: identifier },
        ],
      },
      include: {
        profile: { include: { wallet: true } },
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta está suspendida');
    }

    if (user.profile) {
      const now = new Date();
      await this.prisma.profile.update({
        where: { userId: user.id },
        data: { lastLoginAt: now },
      });
      user.profile.lastLoginAt = now;
    }

    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // ─── LOGIN / REGISTRO GOOGLE ─────────────────────────────────────────────────

  async loginWithGoogle(idToken: string) {
    const tokenInfo = await this.verifyGoogleIdToken(idToken);

    const email = tokenInfo.email?.trim().toLowerCase();
    if (!email)
      throw new BadRequestException('La cuenta de Google no incluye email');
    if (tokenInfo.email_verified !== 'true')
      throw new UnauthorizedException('Debes verificar tu email en Google');

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: { include: { wallet: true } },
      },
    });

    // Usuario ya registrado → login directo
    if (user) {
      if (!user.isActive)
        throw new UnauthorizedException('Tu cuenta está suspendida');
      const { password: _, ...userWithoutPass } = user;
      return this.buildTokenResponse(userWithoutPass);
    }

    // Usuario nuevo → devuelve tempToken para que elija username y país
    const firstName: string = tokenInfo.given_name ?? '';
    const lastName: string = tokenInfo.family_name ?? '';
    const suggestedUsername = await this.generateUsername(email);

    const tempToken = this.jwtService.sign(
      { googleEmail: email, firstName, lastName, type: 'google_pending' },
      { expiresIn: '10m' },
    );

    return {
      needsRegistration: true,
      tempToken,
      googleEmail: email,
      firstName,
      lastName,
      suggestedUsername,
    };
  }

  async completeGoogleRegistration(
    tempPayload: {
      googleEmail: string;
      firstName: string;
      lastName: string;
      type: string;
    },
    username: string,
    countryIso: string,
  ) {
    if (tempPayload.type !== 'google_pending') {
      throw new UnauthorizedException('Token inválido');
    }

    const email = tempPayload.googleEmail.trim().toLowerCase();
    const cleanUser = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const cleanIso = countryIso.trim().toUpperCase();

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail)
      throw new ConflictException('El email ya está registrado');

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: cleanUser },
    });
    if (existingUsername) {
      const suggestions = await this.generateUsernameSuggestions(cleanUser);
      throw new ConflictException({
        message: 'El username ya está en uso',
        suggestions,
      });
    }

    const country = await this.prisma.country.findUnique({
      where: { iso: cleanIso },
    });
    if (!country)
      throw new BadRequestException('El país seleccionado no existe');

    const user = await this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email,
          phone: null,
          username: cleanUser,
          password: '',
          profile: {
            create: {
              countryIso: cleanIso,
              firstName: tempPayload.firstName,
              lastName: tempPayload.lastName,
              wallet: {
                create: { currency: country.currency, balance: 0 },
              },
            },
          },
        },
        include: {
          profile: { include: { wallet: true } },
        },
      });
    });

    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // ─── RECUPERAR CONTRASEÑA ────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.email) {
      return {
        message:
          'Si el correo está registrado, recibirás un código de recuperación.',
      };
    }

    const code = randomInt(0, 1000000).toString().padStart(6, '0');
    const codeHash = this.buildResetCodeHash(email, code);
    const expiresAt = new Date(Date.now() + AuthService.RESET_CODE_TTL_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: codeHash, resetPasswordExpiry: expiresAt },
    });

    const name = user.profile
      ? `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim() ||
        'Usuario'
      : 'Usuario';

    await this.mailService.sendPasswordResetEmail(user.email, name, code, 15);

    return {
      message:
        'Si el correo está registrado, recibirás un código de recuperación.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      !user.resetPasswordToken ||
      !user.resetPasswordExpiry ||
      user.resetPasswordExpiry.getTime() <= Date.now()
    ) {
      throw new BadRequestException('Código inválido o expirado');
    }

    const attemptsKey = `reset_attempts_${email}`;
    const attempts = Number((await this.cache.get<number>(attemptsKey)) ?? 0);

    if (attempts >= AuthService.RESET_MAX_ATTEMPTS) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpiry: null },
      });
      throw new BadRequestException('Código inválido o expirado');
    }

    const incomingHash = this.buildResetCodeHash(email, dto.code.trim());
    const valid = this.safeStringEqual(incomingHash, user.resetPasswordToken);

    if (!valid) {
      const ttlMs = Math.max(
        user.resetPasswordExpiry.getTime() - Date.now(),
        1000,
      );
      await this.cache.set(attemptsKey, attempts + 1, ttlMs);
      throw new BadRequestException('Código inválido o expirado');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });
    await this.cache.del(attemptsKey);

    return { message: 'Contraseña actualizada correctamente' };
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private buildTokenResponse(user: {
    id: string;
    email: string | null;
    username: string;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  private buildResetCodeHash(email: string, code: string) {
    const secret = process.env.RESET_PASSWORD_CODE_SECRET ?? '';
    return createHash('sha256')
      .update(`${email}:${code}:${secret}`)
      .digest('hex');
  }

  private safeStringEqual(a: string, b: string) {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }

  private async verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
    const url = new URL('https://oauth2.googleapis.com/tokeninfo');
    url.searchParams.set('id_token', idToken);
    const res = await fetch(url.toString());
    if (!res.ok)
      throw new UnauthorizedException('Token de Google inválido o expirado');
    const info = (await res.json()) as GoogleTokenInfo;
    if (!info.sub) throw new UnauthorizedException('Token de Google inválido');
    return info;
  }
}
