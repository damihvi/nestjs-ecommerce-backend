import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Trust proxy for Railway (important for health checks)
    app.set('trust proxy', 1);
    
    // Disable X-Powered-By header for security
    app.getHttpAdapter().getInstance().disable('x-powered-by');
    
    // Enable CORS for Railway deployment
    app.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://*.railway.app', 'https://*.up.railway.app'] 
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
  
  // Set global prefix for API
  app.setGlobalPrefix('api', { exclude: ['health', '/'] });
    const port = process.env.PORT || 3000;
  const host = '0.0.0.0'; // Always bind to all interfaces for Railway
  
  await app.listen(port, host);
  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`🔗 Health check available at: http://${host}:${port}/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 Critical error during bootstrap:', error);
  process.exit(1);
});
