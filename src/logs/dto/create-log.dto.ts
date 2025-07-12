import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateLogDto {
  @IsString()
  level: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
