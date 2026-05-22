import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Category } from '@prisma/client';

export class RegisterTechnicianDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}
