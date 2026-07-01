import { Module } from '@nestjs/common';
import { ServiceTypeController } from './serviceType.controller';
import { ServiceTypeService } from './serviceType.service';

@Module({
    controllers: [ServiceTypeController],
    providers: [ServiceTypeService],
})
export class ServiceTypeModule { }
