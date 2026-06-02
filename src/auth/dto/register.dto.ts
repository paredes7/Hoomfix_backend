import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString({ message: 'Teléfono inválido' })
  phone?: string;

  @IsString()
  username!: string;

  @IsString()
  countryIso!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
