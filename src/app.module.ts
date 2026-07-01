import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { DebugModule } from './debug/debug.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';
import { ProfileModule } from './profile/profile.module';
import { CountryModule } from './country/country.module';
import { ProviderServiceModule } from './providerService/providerService.module';
import { AdminModule } from './admin/admin.module';
import { ServiceTypeModule } from './serviceType/serviceType.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    NotificationsModule,
    MailModule,
    ProfileModule,
    CountryModule,
    DebugModule,
    ProviderServiceModule,
    AdminModule,
    ServiceTypeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
