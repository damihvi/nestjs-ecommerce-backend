import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsEventDto, AnalyticsQueryDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  trackEvent(@Body() createAnalyticsEventDto: CreateAnalyticsEventDto) {
    return this.analyticsService.trackEvent(createAnalyticsEventDto);
  }

  @Get('events')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getEvents(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getEvents(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getEventStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getEventStats(start, end);
  }

  @Get('top-products')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getTopProducts(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getTopProducts(start, end);
  }

  @Get('search-terms')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getSearchTerms(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getSearchTerms(start, end);
  }

  @Get('user-activity/:userId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getUserActivity(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getUserActivity(userId, start, end);
  }

  @Get('daily-stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getDailyStats(@Query('days') days?: number) {
    return this.analyticsService.getDailyStats(days);
  }

  @Get('conversion-funnel')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getConversionFunnel(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getConversionFunnel(start, end);
  }
}
