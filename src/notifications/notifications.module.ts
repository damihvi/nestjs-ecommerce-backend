import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationService } from './notification-push.service';
import { NotificationPushController } from './notification-push.controller';
import { Notification } from './notification.entity';
import { NotificationMongo, NotificationMongoSchema } from '../schemas/notification.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    MongooseModule.forFeature([
      { name: NotificationMongo.name, schema: NotificationMongoSchema }
    ], 'mongodb'),
  ],
  controllers: [NotificationsController, NotificationPushController],
  providers: [NotificationsService, NotificationService],
  exports: [NotificationsService, NotificationService],
})
export class NotificationsModule {}
