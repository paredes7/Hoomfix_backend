import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // LISTA TODAS LAS POSTULACIONES PENDIENTES
    @Get('providers/pending')
    getPendingProviders() {
        return this.adminService.getPendingProviders();
    }

    // APRUEBA UNA POSTULACION
    @Patch('providers/:id/approve')
    approveProvider(@Param('id') id: string) {
        return this.adminService.approveProvider(id);
    }

    // RECHAZA UNA POSTULACION
    @Patch('providers/:id/reject')
    rejectProvider(@Param('id') id: string) {
        return this.adminService.rejectProvider(id);
    }
}
