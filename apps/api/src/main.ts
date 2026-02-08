import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: [
      'http://localhost:5500',
      'http://localhost:4321',
      'https://www.procurement-ai.de',
      'https://app.procurement-ai.de',
    ],
    credentials: true,
  });
  app.useBodyParser('urlencoded', { extended: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('KI-Klassifizierungsmodul für eProcurement')
    .setDescription(
      'API für KI-gestützte Klassifizierung von Beschaffungsartikeln, ' +
        'Marktplatzsuche und revisionssichere Vergabedokumentation.',
    )
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('API_PORT', 3050);
  await app.listen(port);
  console.log(`API läuft auf http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

bootstrap();
