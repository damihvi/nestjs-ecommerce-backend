import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsEvent } from './analytics-event.entity';
import { Analytics, AnalyticsSchema } from '../schemas/analytics.schema';

@Module({
  imports: [
    // PostgreSQL para eventos tradicionales
    TypeOrmModule.forFeature([AnalyticsEvent]),
    // MongoDB para analytics avanzados
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema }
    ], 'mongodb'),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
