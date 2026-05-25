import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier!: string; // Email o username

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
