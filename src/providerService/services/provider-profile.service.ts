import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProviderProfileDto } from '../dto/update-profile.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class ProviderProfileService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService) { }

    // METODO PARA ACTUALIZAR EL PERFIL DE UN PROVEEDOR DE SERVICIOS
    async updateProfile(userId: string, providerServiceId: string, dto: UpdateProviderProfileDto) {
        const providerService = await this.prisma.providerService.findUnique({
            where: { id: providerServiceId },
        });

        if (!providerService) throw new NotFoundException('Especialidad no encontrada');
        if (providerService.userId !== userId) throw new ForbiddenException('No tienes permiso');

        return this.prisma.providerServiceProfile.update({
            where: { providerServiceId },
            data: dto,
        });
    }

    // METODO PARA ACTUALIZAR LA FOTO DE PERFIL DE UN PROVEEDOR DE SERVICIOS
    async updatePhoto(userId: string, providerServiceId: string, file: Express.Multer.File) {
        const providerService = await this.prisma.providerService.findUnique({
            where: { id: providerServiceId },
            include: { profile: true },
        });

        if (!providerService) throw new NotFoundException('Especialidad no encontrada');
        if (providerService.userId !== userId) throw new ForbiddenException('No tienes permiso');

        if (providerService.profile?.servicePhotoPublicId) {
            await this.cloudinary.deleteFile(providerService.profile.servicePhotoPublicId, 'image');
        }

        const { secureUrl, publicId } = await this.cloudinary.uploadFile({
            file,
            folder: `provider-service-photos/${providerServiceId}`,
        });

        return this.prisma.providerServiceProfile.update({
            where: { providerServiceId },
            data: { servicePhoto: secureUrl, servicePhotoPublicId: publicId },
        });
    }

}
