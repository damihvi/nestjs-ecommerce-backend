import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto/cart.dto';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addToCart(addToCartDto: AddToCartDto): Promise<CartItem | null> {
    try {
      // Verify user exists
      const user = await this.userRepository.findOne({ where: { id: addToCartDto.userId } });
      if (!user) return null;

      // Verify product exists and is active
      const product = await this.productRepository.findOne({ 
        where: { id: addToCartDto.productId, isActive: true }
      });
      if (!product) return null;

      // Check if product has enough stock
      if (product.stock < addToCartDto.quantity) return null;

      // Check if item already exists in cart
      const existingItem = await this.cartItemRepository.findOne({
        where: {
          userId: addToCartDto.userId,
          productId: addToCartDto.productId,
        },
      });

      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + addToCartDto.quantity;
        if (product.stock < newQuantity) return null;
        
        existingItem.quantity = newQuantity;
        return await this.cartItemRepository.save(existingItem);
      } else {
        // Create new cart item
        const cartItem = this.cartItemRepository.create({
          userId: addToCartDto.userId,
          productId: addToCartDto.productId,
          quantity: addToCartDto.quantity,
        });
        return await this.cartItemRepository.save(cartItem);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      return null;
    }
  }

  async getCart(userId: string): Promise<CartItem[] | null> {
    try {
      const cartItems = await this.cartItemRepository.find({
        where: { userId },
        relations: ['product'],
        order: { createdAt: 'ASC' },
      });

      // Filter out items with inactive products
      return cartItems.filter(item => item.product.isActive);
    } catch (err) {
      console.error('Error getting cart:', err);
      return null;
    }
  }

  async updateCartItem(cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<CartItem | null> {
    try {
      const cartItem = await this.cartItemRepository.findOne({
        where: { id: cartItemId },
        relations: ['product'],
      });

      if (!cartItem) return null;

      // Check stock availability
      if (cartItem.product.stock < updateCartItemDto.quantity) return null;

      cartItem.quantity = updateCartItemDto.quantity;
      return await this.cartItemRepository.save(cartItem);
    } catch (err) {
      console.error('Error updating cart item:', err);
      return null;
    }
  }

  async removeFromCart(removeFromCartDto: RemoveFromCartDto): Promise<boolean> {
    try {
      const result = await this.cartItemRepository.delete({
        userId: removeFromCartDto.userId,
        productId: removeFromCartDto.productId,
      });

      return (result.affected || 0) > 0;
    } catch (err) {
      console.error('Error removing from cart:', err);
      return false;
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      const result = await this.cartItemRepository.delete({ userId });
      return (result.affected || 0) >= 0;
    } catch (err) {
      console.error('Error clearing cart:', err);
      return false;
    }
  }

  async getCartSummary(userId: string): Promise<any> {
    try {
      const cartItems = await this.getCart(userId);
      if (!cartItems) return null;

      let totalItems = 0;
      let subtotal = 0;

      cartItems.forEach(item => {
        totalItems += item.quantity;
        subtotal += item.product.price * item.quantity;
      });

      const taxRate = 0.08; // 8% tax
      const taxAmount = subtotal * taxRate;
      const shippingCost = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
      const total = subtotal + taxAmount + shippingCost;

      return {
        items: cartItems,
        totalItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        shippingCost: parseFloat(shippingCost.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      };
    } catch (err) {
      console.error('Error getting cart summary:', err);
      return null;
    }
  }

  async removeUnavailableItems(userId: string): Promise<number> {
    try {
      const cartItems = await this.cartItemRepository.find({
        where: { userId },
        relations: ['product'],
      });

      let removedCount = 0;
      
      for (const item of cartItems) {
        if (!item.product.isActive || item.product.stock < item.quantity) {
          await this.cartItemRepository.remove(item);
          removedCount++;
        }
      }

      return removedCount;
    } catch (err) {
      console.error('Error removing unavailable items:', err);
      return 0;
    }
  }
}
