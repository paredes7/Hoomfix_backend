import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUsernameService } from './auth-username.service';
import { RegisterDto } from '../dto/register.dto';
import { GoogleCompleteDto } from '../dto/google-complete.dto';

interface GoogleTokenInfo {
  sub: string;
  email: string;
  email_verified: string;
  given_name?: string;
  family_name?: string;
}

@Injectable()
export class AuthRegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usernameService: AuthUsernameService,
  ) {}

  // METODO PARA REGISTRO NORMAL CON EMAIL/PHONE
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
      const suggestions = await this.usernameService.suggestions(username);
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

    return this.prisma.$transaction((tx) =>
      tx.user.create({
        data: {
          email: email ?? null,
          phone: phone ?? null,
          username,
          password: hashedPassword,
          profile: {
            create: {
              countryIso,
              wallet: {
                create: { currency: country.currency, balance: 0 },
              },
            },
          },
        },
        include: { profile: { include: { wallet: true } } },
      }),
    );
  }

  // METODO PARA COMPLETAR REGISTRO DE GOOGLE
  async completeGoogleRegistration(
    tempPayload: {
      googleEmail: string;
      firstName: string;
      lastName: string;
      type: string;
    },
    dto: GoogleCompleteDto,
  ) {
    if (tempPayload.type !== 'google_pending') {
      throw new UnauthorizedException('Token inválido');
    }

    const email = tempPayload.googleEmail.trim().toLowerCase();
    const username = dto.username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const countryIso = dto.countryIso.trim().toUpperCase();

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail)
      throw new ConflictException('El email ya está registrado');

    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      const suggestions = await this.usernameService.suggestions(username);
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

    return this.prisma.$transaction((tx) =>
      tx.user.create({
        data: {
          email,
          phone: null,
          username,
          password: '',
          profile: {
            create: {
              countryIso,
              firstName: tempPayload.firstName,
              lastName: tempPayload.lastName,
              wallet: {
                create: { currency: country.currency, balance: 0 },
              },
            },
          },
        },
        include: { profile: { include: { wallet: true } } },
      }),
    );
  }

  // METODO PARA VERIFICAR SI EL USUARIO YA ESTA REGISTRADO
  buildTempToken(tokenInfo: GoogleTokenInfo, suggestedUsername: string) {
    const firstName = tokenInfo.given_name ?? '';
    const lastName = tokenInfo.family_name ?? '';

    const tempToken = this.jwtService.sign(
      {
        googleEmail: tokenInfo.email,
        firstName,
        lastName,
        type: 'google_pending',
      },
      { expiresIn: '10m' },
    );

    return {
      needsRegistration: true,
      tempToken,
      googleEmail: tokenInfo.email,
      firstName,
      lastName,
      suggestedUsername,
    };
  }
}
