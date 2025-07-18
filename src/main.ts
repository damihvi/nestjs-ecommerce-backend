import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS with a simpler configuration
    app.enableCors({
      origin: true, // Allow all origins
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: '*',
    });

    // Basic session configuration
    app.use(
      session({
        secret: process.env.SESSION_SECRET || 'dev-secret',
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false }
      }),
    );

    // Initialize Passport with basic configuration
    app.use(passport.initialize());
    app.use(passport.session());

    // Simpler validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    // Configure static files
    app.useStaticAssets(join(__dirname, '..', 'public'));

    // Set global API prefix
    app.setGlobalPrefix('api');

    // Start server
    const port = process.env.PORT || 3101;
    await app.listen(port);
    console.log(`Server running on port ${port}`);

  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
