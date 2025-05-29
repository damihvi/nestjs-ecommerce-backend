import { Controller, Post, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seedDatabase() {
    const result = await this.seedService.seedDatabase();
    return new SuccessResponseDto('Database seeded successfully', result);
  }

  @Delete()
  async clearDatabase() {
    const result = await this.seedService.clearDatabase();
    return new SuccessResponseDto('Database cleared successfully', result);
  }
}