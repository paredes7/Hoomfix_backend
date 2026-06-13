import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class AuthPasswordService {
  private static readonly RESET_CODE_TTL_MS = 15 * 60 * 1000;
  private static readonly RESET_MAX_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

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
    const codeHash = this.buildCodeHash(email, code);
    const expiresAt = new Date(
      Date.now() + AuthPasswordService.RESET_CODE_TTL_MS,
    );

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
    const attempts = Number(
      (await this.cache.get<number>(attemptsKey)) ?? 0,
    );

    if (attempts >= AuthPasswordService.RESET_MAX_ATTEMPTS) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpiry: null },
      });
      throw new BadRequestException('Código inválido o expirado');
    }

    const incomingHash = this.buildCodeHash(email, dto.code.trim());
    const valid = this.safeEqual(incomingHash, user.resetPasswordToken);

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

  private buildCodeHash(email: string, code: string): string {
    const secret = process.env.RESET_PASSWORD_CODE_SECRET ?? '';
    return createHash('sha256')
      .update(`${email}:${code}:${secret}`)
      .digest('hex');
  }

  private safeEqual(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }
}
