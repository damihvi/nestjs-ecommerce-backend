import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalyticsData(@Query('period') period: string = '7d') {
    return this.dashboardService.getAnalyticsData(period);
  }

  @Get('heatmap')
  async getUserActivityHeatmap() {
    return this.dashboardService.getHeatmapData();
  }

  @Get('top-pages')
  async getTopPages() {
    return this.dashboardService.getTopPages();
  }

  @Get('conversion-funnel')
  async getConversionFunnel() {
    return this.dashboardService.getConversionFunnel();
  }

  @Post('track-event')
  async trackEvent(@Body() eventData: any) {
    return this.dashboardService.trackEvent(eventData);
  }
}
