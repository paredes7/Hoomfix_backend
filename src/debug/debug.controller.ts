import { Controller, Get } from '@nestjs/common';

// Controlador temporal para probar Sentry — eliminar en producción
@Controller('debug')
export class DebugController {
  @Get('sentry')
  testSentry() {
    throw new Error('Test Sentry error!');
  }
}
