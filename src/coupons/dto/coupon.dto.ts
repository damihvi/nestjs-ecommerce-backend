import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '../coupon.entity';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimitPerUser?: number = 1;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableProducts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedProducts?: string[];

  @IsOptional()
  @IsBoolean()
  isFirstTimeUserOnly?: boolean = false;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimitPerUser?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableProducts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedProducts?: string[];

  @IsOptional()
  @IsBoolean()
  isFirstTimeUserOnly?: boolean;
}

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  orderTotal: number;

  @IsOptional()
  @IsArray()
  orderItems?: any[];
}
