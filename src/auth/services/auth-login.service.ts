import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUsernameService } from './auth-username.service';
import { LoginDto } from '../dto/login.dto';

interface GoogleTokenInfo {
  sub: string;
  email: string;
  email_verified: string;
  given_name?: string;
  family_name?: string;
}

@Injectable()
export class AuthLoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usernameService: AuthUsernameService,
  ) {}

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
      include: { profile: { include: { wallet: true } } },
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

    return user;
  }

  async loginWithGoogle(tokenInfo: GoogleTokenInfo) {
    if (tokenInfo.email_verified !== 'true') {
      throw new UnauthorizedException('Debes verificar tu email en Google');
    }

    const email = tokenInfo.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: { include: { wallet: true } } },
    });

    if (!user) return null;

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta está suspendida');
    }

    return user;
  }

  async verifyGoogleToken(idToken: string): Promise<GoogleTokenInfo> {
    const url = new URL('https://oauth2.googleapis.com/tokeninfo');
    url.searchParams.set('id_token', idToken);
    const res = await fetch(url.toString());
    if (!res.ok)
      throw new UnauthorizedException('Token de Google inválido o expirado');
    const info = (await res.json()) as GoogleTokenInfo;
    if (!info.sub) throw new UnauthorizedException('Token de Google inválido');
    return info;
  }

  async suggestedUsername(email: string): Promise<string> {
    return this.usernameService.generate(email);
  }
}
