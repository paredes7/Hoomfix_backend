import 'multer';
import { Injectable } from '@nestjs/common';
import { ProviderApplyService } from './services/provider-apply.service';
import { ProviderDocumentsService } from './services/provider-documents.service';
import { ApplyProviderDto } from './dto/apply-provider.dto';
import { ProviderQueryService } from './services/provider-query.service';
import { ProviderAvailabilityService } from './services/provider-availability.service';
import { ProviderProfileService } from './services/provider-profile.service';
import { UpdateProviderProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProviderServiceService {
    constructor(
        private readonly applyService: ProviderApplyService,
        private readonly documentsService: ProviderDocumentsService,
        private readonly queryService: ProviderQueryService,
        private readonly availabilityService: ProviderAvailabilityService,
        private readonly profileService: ProviderProfileService,
    ) { }

    // ENDPOINT PARA APLICAR A SER UN PROVEEDOR DE SERVICIOS
    apply(userId: string, dto: ApplyProviderDto) {
        return this.applyService.apply(userId, dto);
    }

    // ENDPOINT PARA SUBIR UN DOCUMENTO DE VERIFICACION
    uploadDocument(userId: string, providerServiceId: string, file: Express.Multer.File, name?: string) {
        return this.documentsService.uploadDocument(userId, providerServiceId, file, name);
    }

    // ENDPOINT PARA OBTENER LOS DOCUMENTOS DE UNA ESPECIALIDAD
    getDocuments(userId: string, providerServiceId: string) {
        return this.documentsService.getDocuments(userId, providerServiceId);
    }

    // ENDPOINT PARA OBTENER UN SERVICIO POR ID
    getServiceById(userId: string, providerServiceId: string) {
        return this.queryService.getServiceById(userId, providerServiceId);
    }

    // ENDPOINT PARA OBTENER MIS SERVICIOS
    getMyServices(userId: string) {
        return this.queryService.getMyServices(userId);
    }

    // ENDPOINT PARA ELIMINAR UN DOCUMENTO
    deleteDocument(userId: string, documentId: string) {
        return this.documentsService.deleteDocument(userId, documentId);
    }

    // ENDPOINT PARA ENVIAR DOCUMENTOS A REVISION
    submitForReview(userId: string, providerServiceId: string) {
        return this.documentsService.submitForReview(userId, providerServiceId);
    }

    // ENDPOINT PARA ACTIVAR/DESACTIVAR LA DISPONIBILIDAD DE UNA ESPECIALIDAD
    toggleAvailability(userId: string, providerServiceId: string, available: boolean) {
        return this.availabilityService.toggleAvailability(userId, providerServiceId, available);
    }

    // ENDPOINT PARA ACTUALIZAR EL PERFIL DE UNA ESPECIALIDAD
    updateProfile(userId: string, providerServiceId: string, dto: UpdateProviderProfileDto) {
        return this.profileService.updateProfile(userId, providerServiceId, dto);
    }

    // ENDPOINT PARA ACTUALIZAR LA FOTO DE PERFIL DE UNA ESPECIALIDAD
    updatePhoto(userId: string, providerServiceId: string, file: Express.Multer.File) {
        return this.profileService.updatePhoto(userId, providerServiceId, file);
    }


}
