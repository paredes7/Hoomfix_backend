import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleAvailabilityDto {

    @ApiProperty({ example: true, description: 'Indica si el proveedor está disponible o no' })
    @IsBoolean()
    available!: boolean;
}