import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleCompleteDto } from './dto/google-complete.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(@Body() body: { idToken: string }) {
    return this.authService.loginWithGoogle(body.idToken);
  }

  @Post('google/complete')
  @HttpCode(HttpStatus.CREATED)
  async completeGoogleRegistration(
    @Body() body: { tempToken: string } & GoogleCompleteDto,
  ) {
    let payload: {
      googleEmail: string;
      firstName: string;
      lastName: string;
      type: string;
    };
    try {
      payload = this.jwtService.verify<{
        googleEmail: string;
        firstName: string;
        lastName: string;
        type: string;
      }>(body.tempToken);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return this.authService.completeGoogleRegistration(
      payload,
      body.username,
      body.countryIso,
    );
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
