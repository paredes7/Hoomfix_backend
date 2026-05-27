import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterTechnicianDto {
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString()
  username!: string;

  @IsString()
  countryIso!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
