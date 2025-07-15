import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponseDto } from '../dto/response.dto';
import { User } from '../../users/user.entity';

@Controller('health')
export class HealthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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

  @Get('users-count')
  async getUsersCount() {
    try {
      const count = await this.userRepository.count();
      return new SuccessResponseDto('Users count retrieved', { count });
    } catch (error) {
      return {
        success: false,
        message: 'Error counting users',
        data: null
      };
    }
  }
}
