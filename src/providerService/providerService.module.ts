import { Module } from '@nestjs/common';
import { ProviderServiceController } from './providerService.controller';
import { ProviderServiceService } from './providerService.service';
import { ProviderApplyService } from './services/provider-apply.service';
import { ProviderDocumentsService } from './services/provider-documents.service';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProviderQueryService } from './services/provider-query.service';
import { ProviderAvailabilityService } from './services/provider-availability.service';
import { ProviderProfileService } from './services/provider-profile.service';

@Module({
    imports: [AuthModule, CloudinaryModule],
    controllers: [ProviderServiceController],
    providers: [
        ProviderServiceService,
        ProviderApplyService,
        ProviderDocumentsService,
        ProviderQueryService,
        ProviderAvailabilityService,
        ProviderProfileService
    ],
})
export class ProviderServiceModule { }
