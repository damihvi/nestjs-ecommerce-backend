import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { AddToWishlistDto, UpdateWishlistItemDto, RemoveFromWishlistDto } from './dto/wishlist.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post('add')
  async addToWishlist(@Body() addToWishlistDto: AddToWishlistDto) {
    const wishlistItem = await this.wishlistsService.addToWishlist(addToWishlistDto);
    if (!wishlistItem) {
      throw new BadRequestException('Failed to add item to wishlist. Item may already exist or product not available.');
    }
    return new SuccessResponseDto('Item added to wishlist successfully', wishlistItem);
  }

  @Get('user/:userId')
  async getWishlist(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const wishlistItems = await this.wishlistsService.getWishlist(userId, { page, limit });
    if (!wishlistItems) {
      throw new InternalServerErrorException('Could not retrieve wishlist');
    }
    return new SuccessResponseDto('Wishlist retrieved successfully', wishlistItems);
  }

  @Get('user/:userId/summary')
  async getWishlistSummary(@Param('userId') userId: string) {
    const summary = await this.wishlistsService.getWishlistSummary(userId);
    if (!summary) {
      throw new InternalServerErrorException('Could not retrieve wishlist summary');
    }
    return new SuccessResponseDto('Wishlist summary retrieved successfully', summary);
  }

  @Get('user/:userId/count')
  async getWishlistCount(@Param('userId') userId: string) {
    const count = await this.wishlistsService.getWishlistCount(userId);
    return new SuccessResponseDto('Wishlist count retrieved successfully', { count });
  }

  @Get('user/:userId/check/:productId')
  async isInWishlist(@Param('userId') userId: string, @Param('productId') productId: string) {
    const isInWishlist = await this.wishlistsService.isInWishlist(userId, productId);
    return new SuccessResponseDto('Wishlist check completed', { isInWishlist });
  }

  @Put('item/:wishlistItemId')
  async updateWishlistItem(
    @Param('wishlistItemId') wishlistItemId: string,
    @Body() updateWishlistItemDto: UpdateWishlistItemDto
  ) {
    const wishlistItem = await this.wishlistsService.updateWishlistItem(wishlistItemId, updateWishlistItemDto);
    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }
    return new SuccessResponseDto('Wishlist item updated successfully', wishlistItem);
  }

  @Delete('remove')
  async removeFromWishlist(@Body() removeFromWishlistDto: RemoveFromWishlistDto) {
    const success = await this.wishlistsService.removeFromWishlist(removeFromWishlistDto);
    if (!success) {
      throw new NotFoundException('Wishlist item not found');
    }
    return new SuccessResponseDto('Item removed from wishlist successfully', null);
  }

  @Delete('user/:userId/clear')
  async clearWishlist(@Param('userId') userId: string) {
    const success = await this.wishlistsService.clearWishlist(userId);
    if (!success) {
      throw new InternalServerErrorException('Failed to clear wishlist');
    }
    return new SuccessResponseDto('Wishlist cleared successfully', null);
  }

  @Delete('user/:userId/cleanup')
  async removeUnavailableItems(@Param('userId') userId: string) {
    const removedCount = await this.wishlistsService.removeUnavailableItems(userId);
    return new SuccessResponseDto(
      `Removed ${removedCount} unavailable items from wishlist`,
      { removedCount }
    );
  }

  @Post('user/:userId/move-to-cart/:productId')
  async moveToCart(@Param('userId') userId: string, @Param('productId') productId: string) {
    const success = await this.wishlistsService.moveToCart(userId, productId);
    if (!success) {
      throw new BadRequestException('Failed to move item to cart');
    }
    return new SuccessResponseDto('Item moved to cart successfully', null);
  }
}
