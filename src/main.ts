import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS for Railway deployment
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      },
    }),
  );

  // Initialize Passport and session support
  app.use(passport.initialize());
  app.use(passport.session());

  // Global pipes and filters (only once)
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true, 
    forbidNonWhitelisted: true 
  }));
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // Important: bind to all interfaces for Railway
  console.log(`🚀 Application is running on port: ${port}`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
bootstrap();
