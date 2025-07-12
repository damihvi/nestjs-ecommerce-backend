import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification-push.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationPushController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @GetUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const userId = user.id;
    return this.notificationService.getUserNotifications(
      userId, 
      parseInt(page), 
      parseInt(limit)
    );
  }

  @Get('stats')
  async getNotificationStats(@GetUser() user: any) {
    return this.notificationService.getNotificationStats(user.id);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') notificationId: string, @GetUser() user: any) {
    return this.notificationService.markAsRead(notificationId, user.id);
  }

  @Post('mark-all-read')
  async markAllAsRead(@GetUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Post('delete/:id')
  async deleteNotification(@Param('id') notificationId: string, @GetUser() user: any) {
    return this.notificationService.deleteNotification(notificationId, user.id);
  }

  @Post('create')
  async createNotification(@Body() notificationData: any, @GetUser() user: any) {
    return this.notificationService.createNotification({
      ...notificationData,
      userId: user.id
    });
  }
}
