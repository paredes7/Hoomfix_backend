import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterService } from './services/auth-register.service';
import { AuthLoginService } from './services/auth-login.service';
import { AuthPasswordService } from './services/auth-password.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleCompleteDto } from './dto/google-complete.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly registerService: AuthRegisterService,
    private readonly loginService: AuthLoginService,
    private readonly passwordService: AuthPasswordService,
  ) { }

  // API PARA REGISTRO CON EMAIL/PHONE
  async register(dto: RegisterDto) {
    const user = await this.registerService.register(dto);
    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // API PARA LOGIN CON EMAIL/PHONE
  async login(dto: LoginDto) {
    const user = await this.loginService.login(dto);
    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // API PARA INICIAR SESIÓN CON GOOGLE
  async loginWithGoogle(idToken: string) {
    const tokenInfo = await this.loginService.verifyGoogleToken(idToken);

    if (!tokenInfo.email) {
      throw new BadRequestException('La cuenta de Google no incluye email');
    }

    const user = await this.loginService.loginWithGoogle(tokenInfo);

    // Usuario ya existe → login directo
    if (user) {
      const { password: _, ...userWithoutPass } = user;
      return this.buildTokenResponse(userWithoutPass);
    }

    // Usuario nuevo → devuelve tempToken
    const suggestedUsername = await this.loginService.suggestedUsername(
      tokenInfo.email,
    );
    return this.registerService.buildTempToken(tokenInfo, suggestedUsername);
  }

  async completeGoogleRegistration(
    tempPayload: {
      googleEmail: string;
      firstName: string;
      lastName: string;
      type: string;
    },
    dto: GoogleCompleteDto,
  ) {
    const user = await this.registerService.completeGoogleRegistration(
      tempPayload,
      dto,
    );
    const { password: _, ...userWithoutPass } = user;
    return this.buildTokenResponse(userWithoutPass);
  }

  // API PARA RECUPERAR CONTRASEÑA
  async forgotPassword(dto: ForgotPasswordDto) {
    return this.passwordService.forgotPassword(dto);
  }

  async resetPassword(dto: ResetPasswordDto) {
    return this.passwordService.resetPassword(dto);
  }

  // MÉTODO AUXILIAR PARA GENERAR JWT Y ESTRUCTURA DE RESPUESTA
  private async buildTokenResponse(user: Record<string, any>) {
    const { isOnboardingCompleted, ...rest } = user;

    const adminRecord = await this.prisma.admin.findUnique({
      where: { userId: user.id },
    });

    const isAdmin = !!adminRecord;

    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        username: user.username,
        isAdmin,
      }),
      user: {
        ...rest,
        isOnboardingComplete: isOnboardingCompleted ?? false,
        isAdmin,
      },
    };
  }
}
