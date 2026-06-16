import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';

// Módulo temporal para probar Sentry — eliminar en producción
@Module({
  controllers: [DebugController],
})
export class DebugModule {}
