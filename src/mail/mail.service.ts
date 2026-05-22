import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  private getErrorCode(error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      return String((error as { code?: unknown }).code ?? 'UNKNOWN');
    }
    return 'UNKNOWN';
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    code: string,
    expiresInMinutes = 15,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Recuperación de contraseña - Hoomfix',
        template: 'reset-password',
        context: {
          firstName,
          code,
          expiresInMinutes,
        },
      });
      this.logger.log(`📧 Email de recuperación enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando email de recuperación a ${email}. code=${this.getErrorCode(error)}`);
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de recuperación. Intenta nuevamente.',
      );
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bienvenido a Hoomfix',
        template: 'welcome',
        context: { firstName },
      });
      this.logger.log(`📧 Email de bienvenida enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando email de bienvenida a ${email}. code=${this.getErrorCode(error)}`);
    }
  }
}
