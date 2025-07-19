import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS for production
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow any Vercel domain or localhost
      if (
        origin.includes('.vercel.app') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:')
      ) {
        return callback(null, true);
      }
      
      // Reject other origins
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  
  // Set global prefix
  app.setGlobalPrefix('api');

  // Start server
  const port = process.env.PORT || 3101;
  const host = process.env.HOST || '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`
🚀 Servidor corriendo en: http://${host}:${port}
📝 API docs disponible en: http://${host}:${port}/api
  `);
}

bootstrap().catch(error => {
  console.error('Error starting application:', error);
  process.exit(1);
});
