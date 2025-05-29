import { IsOptional, IsInt, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType, MovementReason } from '../inventory-movement.entity';

export class CreateInventoryMovementDto {
  @IsString()
  productId: string;

  @IsEnum(MovementType)
  movementType: MovementType;

  @IsEnum(MovementReason)
  reason: MovementReason;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;
}

export class InventoryAdjustmentDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(0)
  newQuantity: number;

  @IsEnum(MovementReason)
  reason: MovementReason;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkInventoryUpdateDto {
  @Type(() => InventoryAdjustmentDto)
  adjustments: InventoryAdjustmentDto[];
}

export class StockAlertThresholdDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(0)
  lowStockThreshold: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  overstockThreshold?: number;
}

export class InventoryReportQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @IsOptional()
  @IsEnum(MovementReason)
  reason?: MovementReason;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;
}
