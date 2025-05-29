import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddToWishlistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWishlistItemDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RemoveFromWishlistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;
}
