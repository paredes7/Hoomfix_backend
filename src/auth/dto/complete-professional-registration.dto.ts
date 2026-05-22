import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Category } from '@prisma/client';

export class CompleteProfessionalRegistrationDto {
  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
