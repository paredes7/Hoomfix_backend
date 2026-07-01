import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminCheckService {
    constructor(private readonly prisma: PrismaService) { }

    // LISTA TODAS LAS POSTULACIONES PENDIENTES CON SUS DOCUMENTOS
    async getPendingProviders() {
        return this.prisma.providerService.findMany({
            where: { status: 'PENDING' },
            include: {
                documents: true,
                profile: true,
                serviceType: true,
                country: { select: { iso: true, name: true } },
                user: { select: { id: true, username: true, email: true, phone: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    // APRUEBA UNA POSTULACION
    async approveProvider(providerServiceId: string) {
        await this.checkExists(providerServiceId);
        return this.prisma.providerService.update({
            where: { id: providerServiceId },
            data: { status: 'APPROVED' },
        });
    }

    // RECHAZA UNA POSTULACION
    async rejectProvider(providerServiceId: string) {
        await this.checkExists(providerServiceId);
        return this.prisma.providerService.update({
            where: { id: providerServiceId },
            data: { status: 'REJECTED' },
        });
    }

    // VERIFICA SI LA POSTULACION EXISTE, SI NO EXISTE LANZA UNA EXCEPCION
    private async checkExists(providerServiceId: string) {
        const ps = await this.prisma.providerService.findUnique({
            where: { id: providerServiceId },
        });
        if (!ps) throw new NotFoundException('Postulación no encontrada');
    }
}
