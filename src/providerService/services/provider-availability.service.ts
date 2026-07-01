import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProviderAvailabilityService {
    constructor(private readonly prisma: PrismaService) { }

    async toggleAvailability(userId: string, providerServiceId: string, available: boolean) {
        const providerService = await this.prisma.providerService.findUnique({
            where: { id: providerServiceId },
        });

        if (!providerService) throw new NotFoundException('Especialidad no encontrada');
        if (providerService.userId !== userId) throw new NotFoundException('Especialidad no encontrada');
        if (providerService.status !== 'APPROVED') throw new BadRequestException('Solo puedes activarte si tu especialidad fue aprobada');

        await this.prisma.providerService.update({
            where: { id: providerServiceId },
            data: { available },
        });
    }
}