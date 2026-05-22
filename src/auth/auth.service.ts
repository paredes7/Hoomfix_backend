import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterTechnicianDto } from './dto/register-technician.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '@prisma/client';

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

  // ─── REGISTRO CLIENTE ────────────────────────────────────────────────────────

  async registerClient(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const existing2 = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing2) throw new ConflictException('El teléfono ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: dto.name,
          email,
          phone: dto.phone,
          password: hashedPassword,
          role: Role.CLIENT,
          wallet: { create: { credits: 0 } },
        },
      });
      return newUser;
    });

    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // ─── REGISTRO TÉCNICO ────────────────────────────────────────────────────────

  async registerTechnician(dto: RegisterTechnicianDto) {
    const email = dto.email?.trim().toLowerCase();

    if (email) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) throw new ConflictException('El email ya está registrado');
    }

    const existing2 = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing2) throw new ConflictException('El teléfono ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: dto.name,
          email: email ?? null,
          phone: dto.phone,
          password: hashedPassword,
          role: Role.TECHNICIAN,
          technician: {
            create: {
              category: dto.category,
              documentUrl: dto.documentUrl ?? null,
              status: 'PENDING',
              available: false,
            },
          },
        },
        include: { technician: true },
      });
      return newUser;
    });

    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // ─── LOGIN GOOGLE ─────────────────────────────────────────────────────────────

  async loginWithGoogle(idToken: string) {
    const tokenInfo = await this.verifyGoogleIdToken(idToken);

    const email = tokenInfo.email?.trim().toLowerCase();
    if (!email) throw new BadRequestException('La cuenta de Google no incluye email');
    if (tokenInfo.email_verified !== 'true') throw new UnauthorizedException('Debes verificar tu email en Google');

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('No tienes cuenta registrada. Regístrate primero.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // ─── RECUPERAR CONTRASEÑA ────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.email) {
      return { message: 'Si el correo está registrado, recibirás un código de recuperación.' };
    }

    const code = randomInt(0, 1000000).toString().padStart(6, '0');
    const codeHash = this.buildResetCodeHash(email, code);
    const expiresAt = new Date(Date.now() + AuthService.RESET_CODE_TTL_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: codeHash, resetPasswordExpiry: expiresAt },
    });

    await this.mailService.sendPasswordResetEmail(user.email, user.name, code, 15);

    return { message: 'Si el correo está registrado, recibirás un código de recuperación.' };
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
      const ttlMs = Math.max(user.resetPasswordExpiry.getTime() - Date.now(), 1000);
      await this.cache.set(attemptsKey, attempts + 1, ttlMs);
      throw new BadRequestException('Código inválido o expirado');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpiry: null },
    });
    await this.cache.del(attemptsKey);

    return { message: 'Contraseña actualizada correctamente' };
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private buildTokenResponse(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  private buildResetCodeHash(email: string, code: string) {
    const secret = process.env.RESET_PASSWORD_CODE_SECRET ?? '';
    return createHash('sha256').update(`${email}:${code}:${secret}`).digest('hex');
  }

  private safeStringEqual(a: string, b: string) {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }

  private async verifyGoogleIdToken(idToken: string) {
    const url = new URL('https://oauth2.googleapis.com/tokeninfo');
    url.searchParams.set('id_token', idToken);
    const res = await fetch(url.toString());
    if (!res.ok) throw new UnauthorizedException('Token de Google inválido o expirado');
    const info = await res.json() as any;
    if (!info.sub) throw new UnauthorizedException('Token de Google inválido');
    return info;
  }
}
