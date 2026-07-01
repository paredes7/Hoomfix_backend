import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyProviderDto {
    @ApiProperty({ example: 'uuid-del-servicio' })
    @IsString()
    serviceTypeId!: string;

    @ApiProperty({ example: 'BO' })
    @IsString()
    countryIso!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    commercialName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    customServiceName?: string;

    @ApiPropertyOptional({ example: 'contacto@miplomeria.com' })
    @IsOptional()
    @IsEmail()
    contactEmail?: string;
}
