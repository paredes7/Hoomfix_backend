import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApplyProviderDto } from '../dto/apply-provider.dto';

@Injectable()
export class ProviderApplyService {
    constructor(private readonly prisma: PrismaService) { }

    // METODO PARA APLICAR A SER UN PROVEEDOR DE SERVICIOS
    async apply(userId: string, dto: ApplyProviderDto) {
        const existing = await this.prisma.providerService.findUnique({
            where: { userId_serviceTypeId: { userId, serviceTypeId: dto.serviceTypeId } },
        });
        if (existing) throw new ConflictException('Ya tienes esta especialidad registrada');

        const country = await this.prisma.country.findUnique({
            where: { iso: dto.countryIso },
        });
        
        if (!country) throw new NotFoundException('País no encontrado');

        return this.prisma.providerService.create({
            data: {
                userId,
                serviceTypeId: dto.serviceTypeId,
                countryIso: dto.countryIso,
                profile: {
                    create: {
                        bio: dto.bio,
                        commercialName: dto.commercialName,
                        customServiceName: dto.customServiceName,
                        contactEmail: dto.contactEmail,
                    },
                },
                providerWallet: {
                    create: { currency: country.currency, balance: 0 },
                },
            },
            include: {
                profile: true,
                providerWallet: true,
                serviceType: true,
                country: { select: { iso: true, name: true, currency: true } },
            },
        });
    }
}
