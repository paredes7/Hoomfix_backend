import { IsEmail } from 'class-validator';

export class SendOtpDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}
