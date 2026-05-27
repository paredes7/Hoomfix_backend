import { IsOptional, IsString, MinLength, MaxLength, Matches, IsArray, ArrayMaxSize } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50)
  lastName!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: 'Máximo 3 números de contacto' })
  @IsString({ each: true })
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { each: true, message: 'Formato de teléfono inválido' })
  phones?: string[];
}
