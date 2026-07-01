import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServiceTypeService } from './serviceType.service';

@ApiTags('ServiceType')
@Controller('service-types')
export class ServiceTypeController {
    constructor(private readonly serviceTypeService: ServiceTypeService) { }

    @Get()
    findAll() {
        return this.serviceTypeService.findAll();
    }
}
