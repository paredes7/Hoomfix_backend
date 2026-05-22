import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 4000;
  const frontendUrl = (
    configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
  ).replace(/\/$/, '');

  app.use((req, res, next) => {
    const { method, originalUrl } = req;
    const startTime = Date.now();
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      logger.log(`${method} ${originalUrl} ${statusCode} - ${responseTime}ms`);
    });
    next();
  });

  app.enableCors({
    origin: [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:8081',
      'http://localhost:19006',
      /http:\/\/192\.168\.\d+\.\d+(:\d+)?/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Hoomfix API')
    .setDescription('Documentación de la API de Hoomfix')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  logger.log(`🌐 CORS habilitado para: ${frontendUrl}`);
  logger.log(`📚 Docs en http://localhost:${port}/docs`);
}
void bootstrap();
