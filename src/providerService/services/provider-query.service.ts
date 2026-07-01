import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProviderQueryService {
    constructor(private readonly prisma: PrismaService) { }

    // METODO PARA OBTENER MIS SERVICIOS
    async getMyServices(userId: string) {
        const services = await this.prisma.providerService.findMany({
            where: { userId },
            include: {
                profile: true,
                providerWallet: true,
                serviceType: true,
                documents: true,
                country: { select: { iso: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        }); 
        return services;
    }

    // METODO PARA OBTENER UN SERVICIO POR ID
    async getServiceById(userId: string, providerServiceId: string) {
        const service = await this.prisma.providerService.findUnique({
            where: { id: providerServiceId },
            include: {
                profile: true,
                providerWallet: true,
                serviceType: true,
                documents: true,
                country: { select: { iso: true, name: true } },
            },
        });

        if(!service) throw new NotFoundException('Servicio no encontrado');
        if (service.userId !== userId) throw new NotFoundException('Servicio no encontrado');
        return service;
    }
}