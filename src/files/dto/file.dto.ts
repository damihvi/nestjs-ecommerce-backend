import { IsOptional, IsString, IsEnum, IsObject } from 'class-validator';
import { FileType } from '../file.entity';

export class CreateFileDto {
  @IsString()
  originalName: string;

  @IsString()
  filename: string;

  @IsString()
  path: string;

  @IsString()
  mimetype: string;

  @IsString()
  size: number;

  @IsEnum(FileType)
  type: FileType;

  @IsString()
  @IsOptional()
  url?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  uploadedBy?: string;
}

export class FileQueryDto {
  @IsOptional()
  @IsEnum(FileType)
  type?: FileType;

  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
