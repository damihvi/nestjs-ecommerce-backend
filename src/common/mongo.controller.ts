import { Controller, Get, Post } from '@nestjs/common';
import { MongoService } from './mongo.service';

@Controller('mongo')
export class MongoController {
  constructor(private readonly mongoService: MongoService) {}

  @Get('collections')
  async getCollections() {
    return this.mongoService.getAllCollections();
  }

  @Post('seed')
  async seedData() {
    return this.mongoService.seedData();
  }

  @Get('test-connection')
  async testConnection() {
    try {
      const result = await this.mongoService.testConnection();
      return {
        success: true,
        message: 'Conexión a MongoDB Atlas exitosa',
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión a MongoDB Atlas',
        error: error.message,
      };
    }
  }
}
