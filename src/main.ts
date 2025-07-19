import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS for production
  app.enableCors({
    origin: [
      'https://ecommerce-frontend-sage-three.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
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
