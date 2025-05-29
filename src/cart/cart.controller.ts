import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto/cart.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    const cartItem = await this.cartService.addToCart(addToCartDto);
    if (!cartItem) {
      throw new BadRequestException('Failed to add item to cart. Check product availability and stock.');
    }
    return new SuccessResponseDto('Item added to cart successfully', cartItem);
  }

  @Get('user/:userId')
  async getCart(@Param('userId') userId: string) {
    const cartItems = await this.cartService.getCart(userId);
    if (!cartItems) {
      throw new InternalServerErrorException('Could not retrieve cart');
    }
    return new SuccessResponseDto('Cart retrieved successfully', cartItems);
  }

  @Get('user/:userId/summary')
  async getCartSummary(@Param('userId') userId: string) {
    const summary = await this.cartService.getCartSummary(userId);
    if (!summary) {
      throw new InternalServerErrorException('Could not retrieve cart summary');
    }
    return new SuccessResponseDto('Cart summary retrieved successfully', summary);
  }

  @Put('item/:cartItemId')
  async updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto
  ) {
    const cartItem = await this.cartService.updateCartItem(cartItemId, updateCartItemDto);
    if (!cartItem) {
      throw new BadRequestException('Failed to update cart item. Check stock availability.');
    }
    return new SuccessResponseDto('Cart item updated successfully', cartItem);
  }

  @Delete('remove')
  async removeFromCart(@Body() removeFromCartDto: RemoveFromCartDto) {
    const success = await this.cartService.removeFromCart(removeFromCartDto);
    if (!success) {
      throw new NotFoundException('Cart item not found');
    }
    return new SuccessResponseDto('Item removed from cart successfully', null);
  }

  @Delete('user/:userId/clear')
  async clearCart(@Param('userId') userId: string) {
    const success = await this.cartService.clearCart(userId);
    if (!success) {
      throw new InternalServerErrorException('Failed to clear cart');
    }
    return new SuccessResponseDto('Cart cleared successfully', null);
  }

  @Delete('user/:userId/cleanup')
  async removeUnavailableItems(@Param('userId') userId: string) {
    const removedCount = await this.cartService.removeUnavailableItems(userId);
    return new SuccessResponseDto(
      `Removed ${removedCount} unavailable items from cart`,
      { removedCount }
    );
  }
}
