import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { WishlistItem } from './wishlist-item.entity';
import { AddToWishlistDto, UpdateWishlistItemDto, RemoveFromWishlistDto } from './dto/wishlist.dto';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(WishlistItem)
    private wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addToWishlist(addToWishlistDto: AddToWishlistDto): Promise<WishlistItem | null> {
    try {
      // Verify user exists
      const user = await this.userRepository.findOne({ where: { id: addToWishlistDto.userId } });
      if (!user) return null;

      // Verify product exists and is active
      const product = await this.productRepository.findOne({ 
        where: { id: addToWishlistDto.productId, isActive: true }
      });
      if (!product) return null;

      // Check if item already exists in wishlist
      const existingItem = await this.wishlistItemRepository.findOne({
        where: {
          userId: addToWishlistDto.userId,
          productId: addToWishlistDto.productId,
        },
      });

      if (existingItem) return null; // Already in wishlist

      // Create new wishlist item
      const wishlistItem = this.wishlistItemRepository.create({
        userId: addToWishlistDto.userId,
        productId: addToWishlistDto.productId,
        notes: addToWishlistDto.notes,
      });

      return await this.wishlistItemRepository.save(wishlistItem);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      return null;
    }
  }

  async getWishlist(userId: string, options: IPaginationOptions): Promise<Pagination<WishlistItem> | null> {
    try {
      const queryBuilder = this.wishlistItemRepository.createQueryBuilder('wishlistItem');
      queryBuilder.leftJoinAndSelect('wishlistItem.product', 'product');
      queryBuilder.leftJoinAndSelect('product.category', 'category');
      queryBuilder.where('wishlistItem.userId = :userId', { userId });
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });
      queryBuilder.orderBy('wishlistItem.createdAt', 'DESC');

      return await paginate<WishlistItem>(queryBuilder, options);
    } catch (err) {
      console.error('Error getting wishlist:', err);
      return null;
    }
  }

  async updateWishlistItem(wishlistItemId: string, updateWishlistItemDto: UpdateWishlistItemDto): Promise<WishlistItem | null> {
    try {
      const wishlistItem = await this.wishlistItemRepository.findOne({
        where: { id: wishlistItemId },
        relations: ['product'],
      });

      if (!wishlistItem) return null;

      Object.assign(wishlistItem, updateWishlistItemDto);
      return await this.wishlistItemRepository.save(wishlistItem);
    } catch (err) {
      console.error('Error updating wishlist item:', err);
      return null;
    }
  }

  async removeFromWishlist(removeFromWishlistDto: RemoveFromWishlistDto): Promise<boolean> {
    try {
      const result = await this.wishlistItemRepository.delete({
        userId: removeFromWishlistDto.userId,
        productId: removeFromWishlistDto.productId,
      });

      return (result.affected || 0) > 0;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      return false;
    }
  }

  async clearWishlist(userId: string): Promise<boolean> {
    try {
      const result = await this.wishlistItemRepository.delete({ userId });
      return (result.affected || 0) >= 0;
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      return false;
    }
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const item = await this.wishlistItemRepository.findOne({
        where: { userId, productId },
      });
      return !!item;
    } catch (err) {
      console.error('Error checking wishlist:', err);
      return false;
    }
  }

  async getWishlistCount(userId: string): Promise<number> {
    try {
      return await this.wishlistItemRepository.count({
        where: { userId },
      });
    } catch (err) {
      console.error('Error getting wishlist count:', err);
      return 0;
    }
  }

  async moveToCart(userId: string, productId: string): Promise<boolean> {
    try {
      // This would typically integrate with the cart service
      // For now, we'll just remove from wishlist
      const removed = await this.removeFromWishlist({ userId, productId });
      return removed;
    } catch (err) {
      console.error('Error moving to cart:', err);
      return false;
    }
  }

  async getWishlistSummary(userId: string): Promise<any> {
    try {
      const wishlistItems = await this.wishlistItemRepository.find({
        where: { userId },
        relations: ['product'],
      });

      const totalItems = wishlistItems.length;
      const totalValue = wishlistItems.reduce((sum, item) => sum + item.product.price, 0);
      const inStockItems = wishlistItems.filter(item => item.product.stock > 0);
      const outOfStockItems = wishlistItems.filter(item => item.product.stock === 0);

      return {
        totalItems,
        totalValue: parseFloat(totalValue.toFixed(2)),
        inStockItems: inStockItems.length,
        outOfStockItems: outOfStockItems.length,
        categories: [...new Set(wishlistItems.map(item => item.product.category?.name).filter(Boolean))],
      };
    } catch (err) {
      console.error('Error getting wishlist summary:', err);
      return null;
    }
  }

  async removeUnavailableItems(userId: string): Promise<number> {
    try {
      const wishlistItems = await this.wishlistItemRepository.find({
        where: { userId },
        relations: ['product'],
      });

      let removedCount = 0;
      
      for (const item of wishlistItems) {
        if (!item.product.isActive) {
          await this.wishlistItemRepository.remove(item);
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
