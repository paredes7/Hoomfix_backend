import { Injectable } from '@nestjs/common';
import { AdminCheckService } from './services/admin-checkService.service';

@Injectable()
export class AdminService {
    constructor(
        private readonly checkService: AdminCheckService,
    ) { }

    // API PARA LISTAR POSTULACIONES PENDIENTES
    getPendingProviders() {
        return this.checkService.getPendingProviders();
    }

    // API PARA APROBAR UNA POSTULACION
    approveProvider(providerServiceId: string) {
        return this.checkService.approveProvider(providerServiceId);
    }

    // API PARA RECHAZAR UNA POSTULACION
    rejectProvider(providerServiceId: string) {
        return this.checkService.rejectProvider(providerServiceId);
    }
}
