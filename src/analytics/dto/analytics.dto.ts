import { IsEnum, IsOptional, IsString, IsObject, IsUUID } from 'class-validator';
import { EventType } from '../analytics-event.entity';

export class CreateAnalyticsEventDto {
  @IsEnum(EventType)
  event: EventType;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  referrer?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsEnum(EventType)
  event?: EventType;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
