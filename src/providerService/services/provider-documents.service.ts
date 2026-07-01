import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class ProviderDocumentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    // METODO PARA SUBIR UN DOCUMENTO DE VERIFICACION
    async uploadDocument(userId: string, providerServiceId: string, file: Express.Multer.File, name?: string) {
        await this.checkOwnership(userId, providerServiceId);

        const { secureUrl, publicId } = await this.cloudinary.uploadFile({
            file,
            folder: `provider-docs/${providerServiceId}`,
        });

        return this.prisma.providerDocument.create({
            data: {
                providerServiceId,
                url: secureUrl,
                publicId,
                name: name ?? null,
            },
        });
    }

    // METODO PARA OBTENER LOS DOCUMENTOS DE UNA ESPECIALIDAD
    async getDocuments(userId: string, providerServiceId: string) {
        await this.checkOwnership(userId, providerServiceId);

        return this.prisma.providerDocument.findMany({
            where: { providerServiceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // METODO PARA ELIMINAR UN DOCUMENTO
    async deleteDocument(userId: string, documentId: string) {
        const doc = await this.prisma.providerDocument.findUnique({
            where: { id: documentId },
            include: { providerService: { select: { userId: true } } },
        });

        if (!doc) throw new NotFoundException('Documento no encontrado');
        if (doc.providerService.userId !== userId) throw new ForbiddenException('No tienes permiso para eliminar este documento');

        const resourceType = doc.url.includes('/raw/upload/') ? 'raw' : 'image';
        await this.cloudinary.deleteFile(doc.publicId, resourceType);
        await this.prisma.providerDocument.delete({ where: { id: documentId } });

        return { message: 'Documento eliminado correctamente' };
    }

    // METODO PARA ENVIAR LOS DOCUMENTOS A REVISION
    async submitForReview(userId: string, providerServiceId: string) {
        const ps = await this.prisma.providerService.findUnique({
            where: { id: providerServiceId },
            select: { userId: true, status: true, documents: { select: { id: true } } },
        });

        if (!ps) throw new NotFoundException('Especialidad no encontrada');
        if (ps.userId !== userId) throw new ForbiddenException('No tienes permiso');
        if (ps.status !== 'PENDING') throw new BadRequestException('Solo puedes enviar a revisión servicios en estado PENDIENTE');
        if (ps.documents.length === 0) throw new BadRequestException('Debes subir al menos un documento antes de enviar a revisión');

        await this.prisma.providerService.update({
            where: { id: providerServiceId },
            data: { submittedForReview: true },
        });

        return { message: 'Tus documentos han sido enviados a revisión. El proceso toma entre 24 y 48 horas hábiles.' };
    }

    // VERIFICA QUE EL PROVIDER SERVICE PERTENECE AL USUARIO
    private async checkOwnership(userId: string, providerServiceId: string) {
        const ps = await this.prisma.providerService.findUnique({
            where: { id: providerServiceId },
            select: { userId: true },
        });

        if (!ps) throw new NotFoundException('Especialidad no encontrada');
        if (ps.userId !== userId) throw new ForbiddenException('No tienes permiso para acceder a esta especialidad');
    }
}
