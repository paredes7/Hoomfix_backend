import './instrument';
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

  app.use(
    (
      req: { method: string; originalUrl: string },
      res: { statusCode: number; on: (event: string, cb: () => void) => void },
      next: () => void,
    ) => {
      const { method, originalUrl } = req;
      const startTime = Date.now();
      res.on('finish', () => {
        const { statusCode } = res;
        const responseTime = Date.now() - startTime;
        logger.log(
          `${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
        );
      });
      next();
    },
  );

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

  const env = configService.get<string>('NODE_ENV') ?? 'development';
  const dbUrl = configService.get<string>('DATABASE_URL') ?? '';
  const dbHost = dbUrl ? new URL(dbUrl).hostname : 'no configurada';

  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.log('          HOOMFIX BACKEND  —  INICIADO              ');
  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.log(`  Entorno     : ${env}`);
  logger.log(`  Servidor    : http://localhost:${port}`);
  logger.log(`  Docs API    : http://localhost:${port}/docs`);
  logger.log(`  Base datos  : ${dbHost}`);
  logger.log(`  CORS        : ${frontendUrl}`);
  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
bootstrap().catch((err) => {
  console.error('ERROR AL INICIAR EL SERVIDOR:', err);
  process.exit(1);
});
