import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number = 0;
}

export class ImageDetailDto {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  altText?: string;
  isPrimary: boolean;
  order: number;
}
