import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminCheckService } from './services/admin-checkService.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [AdminController],
    providers: [AdminService, AdminCheckService],
})
export class AdminModule { }
