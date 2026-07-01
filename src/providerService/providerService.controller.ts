import {
    Body, Controller, Delete, Get, Param,
    Post, UploadedFile, UseGuards, UseInterceptors, Patch
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderServiceService } from './providerService.service';
import { ApplyProviderDto } from './dto/apply-provider.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
import { UpdateProviderProfileDto } from './dto/update-profile.dto';

@ApiTags('ProviderService')
@Controller('provider-service')
@UseGuards(JwtAuthGuard)
export class ProviderServiceController {
    constructor(private readonly providerServiceService: ProviderServiceService) { }

    // API PARA APLICAR A SER UN PROVEEDOR DE SERVICIOS
    @Post('apply')
    apply(
        @CurrentUser() user: { userId: string },
        @Body() dto: ApplyProviderDto,
    ) {
        return this.providerServiceService.apply(user.userId, dto);
    }

    // API PARA SUBIR UN DOCUMENTO DE VERIFICACION
    @Post(':id/documents')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    uploadDocument(
        @CurrentUser() user: { userId: string },
        @Param('id') providerServiceId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('name') name?: string,
    ) {
        return this.providerServiceService.uploadDocument(user.userId, providerServiceId, file, name);
    }

    // API PARA OBTENER LOS DOCUMENTOS DE UNA ESPECIALIDAD
    @Get(':id/documents')
    getDocuments(
        @CurrentUser() user: { userId: string },
        @Param('id') providerServiceId: string,
    ) {
        return this.providerServiceService.getDocuments(user.userId, providerServiceId);
    }

    // API PARA ELIMINAR UN DOCUMENTO
    @Delete('documents/:docId')
    deleteDocument(
        @CurrentUser() user: { userId: string },
        @Param('docId') documentId: string,
    ) {
        return this.providerServiceService.deleteDocument(user.userId, documentId);
    }

    // API PARA ENVIAR DOCUMENTOS A REVISION
    @Post(':id/submit-review')
    submitForReview(
        @CurrentUser() user: { userId: string },
        @Param('id') providerServiceId: string,
    ) {
        return this.providerServiceService.submitForReview(user.userId, providerServiceId);
    }

    // API PARA OBTENER MIS SERVICIOS
    @Get('my-services')
    getMyServices(@CurrentUser() user: { userId: string }) {
        return this.providerServiceService.getMyServices(user.userId);
    }

    // API PARA CAMBIAR LA DISPONIBILIDAD DE UN SERVICIO
    @Patch(':id/toggle-availability')
    toggleAvailability(
        @CurrentUser() user: { userId: string },
        @Param('id') providerServiceId: string,
        @Body() dto: ToggleAvailabilityDto,
    ) {
        return this.providerServiceService.toggleAvailability(user.userId, providerServiceId, dto.available);
    }

    // API PARA ACTUALIZAR EL PERFIL DE UNA ESPECIALIDAD
    @Patch(':id/profile')
    updateProfile(
        @CurrentUser() user: { userId: string },
        @Param('id') providerServiceId: string,
        @Body() dto: UpdateProviderProfileDto,
    ) {
        return this.providerServiceService.updateProfile(user.userId, providerServiceId, dto);
    }

    // API PARA ACTUALIZAR LA FOTO DE PERFIL DE UNA ESPECIALIDAD
    @Patch(':id/photo')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    updatePhoto(
        @CurrentUser() user: { userId: string },
        @Param('id') providerServiceId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.providerServiceService.updatePhoto(user.userId, providerServiceId, file);
    }


    // API PARA OBTENER UN SERVICIO POR ID
    @Get(':id')
    getServiceById(
        @CurrentUser() user: { userId: string },
        @Param('id') providerServiceId: string,
    ) {
        return this.providerServiceService.getServiceById(user.userId, providerServiceId);
    }
}
