import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { HybridService } from './hybrid.service';

@Controller('hybrid')
export class HybridController {
  constructor(private readonly hybridService: HybridService) {}

  @Post('user')
  async createUser(@Body() userData: any) {
    return this.hybridService.createUser(userData);
  }

  @Get('stats')
  async getStats() {
    return this.hybridService.getCompleteStats();
  }

  @Post('sync')
  async syncData() {
    return this.hybridService.syncCriticalData();
  }

  @Get('user/:userId')
  async getCombinedUserData(@Param('userId') userId: string) {
    return this.hybridService.getUserComplete(userId);
  }
}
