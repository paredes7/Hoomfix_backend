import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsNumber, MaxLength, Min } from 'class-validator';

export class UpdateProviderProfileDto {
    @ApiPropertyOptional({ example: 'Plomero con 5 años de experiencia' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;


    @ApiProperty({ example: 'Nombre comercial', description: 'Nombre comercial del proveedor' })
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    commercialName?: string;

    @ApiProperty({
        example: 'Nombre de servicio personalizado', description: 'Nombre de servicio personalizado para la especialidad del proveedor'
    })
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    customServiceName?: string;

    @ApiPropertyOptional({ example: 5, description: 'Años de experiencia del proveedor' })
    @IsOptional()
    @IsInt()
    @Min(0)
    experience?: number;

    @ApiPropertyOptional({ example: 10, description: 'Radio de cobertura del proveedor' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    coverageRadius?: number;
}
