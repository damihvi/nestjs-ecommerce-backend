import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Analytics, AnalyticsSchema } from '../schemas/analytics.schema';
import { UserSession, UserSessionSchema } from '../schemas/user-session.schema';
import { Log, LogSchema } from '../schemas/log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: Log.name, schema: LogSchema },
    ], 'mongodb'),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
