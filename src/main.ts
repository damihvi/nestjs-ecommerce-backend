import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 Importación necesaria

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // 👈 Tipo específico

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', 'public')); // 👈 Habilita acceso público a /public

  await app.listen(3000);
}
bootstrap();
