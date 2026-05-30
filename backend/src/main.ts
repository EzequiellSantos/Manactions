import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:8080',
  );
  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.getHttpAdapter().get('/', (_req, res) => {
    res.status(200).json({ ok: true, service: 'IntraHub API' });
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('IntraHub API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('areas')
    .addTag('usuarios')
    .addTag('demandas')
    .addTag('notificacoes')
    .addTag('busca')
    .addTag('processos')
    .addTag('dashboard')
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, host);
  console.log(`IntraHub API listening on http://${host}:${port}`);
}
bootstrap().catch((error) => {
  console.error('Failed to bootstrap IntraHub API', error);
  process.exit(1);
});
