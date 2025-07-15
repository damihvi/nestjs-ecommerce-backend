import { Controller, Get } from '@nestjs/common';
import { SuccessResponseDto } from '../dto/response.dto';

@Controller('health')
export class HealthController {
  @Get()
  checkHealth() {
    return new SuccessResponseDto('API is healthy', {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  }
}
