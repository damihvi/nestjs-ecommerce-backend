import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Coupon, CouponType } from './coupon.entity';
import { CouponUsage } from './coupon-usage.entity';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

export interface CouponValidationResult {
  isValid: boolean;
  reason?: string;
  discountAmount?: number;
  coupon?: Coupon;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private couponUsageRepository: Repository<CouponUsage>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon | null> {
    try {
      // Check if code already exists
      const existingCoupon = await this.couponRepository.findOne({
        where: { code: createCouponDto.code.toUpperCase() },
      });

      if (existingCoupon) return null;

      const coupon = this.couponRepository.create({
        ...createCouponDto,
        code: createCouponDto.code.toUpperCase(),
        validFrom: new Date(createCouponDto.validFrom),
        validUntil: new Date(createCouponDto.validUntil),
      });

      return await this.couponRepository.save(coupon);
    } catch (err) {
      console.error('Error creating coupon:', err);
      return null;
    }
  }
  async findAll(
    options: IPaginationOptions,
    filters?: { type?: string; isActive?: boolean }
  ): Promise<Pagination<Coupon> | null> {
    try {
      const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

      if (filters?.isActive !== undefined) {
        queryBuilder.andWhere('coupon.isActive = :isActive', { isActive: filters.isActive });
      }

      if (filters?.type) {
        queryBuilder.andWhere('coupon.type = :type', { type: filters.type });
      }

      queryBuilder.orderBy('coupon.createdAt', 'DESC');

      return await paginate<Coupon>(queryBuilder, options);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<Coupon | null> {
    try {
      return await this.couponRepository.findOne({ where: { id } });
    } catch (err) {
      console.error('Error fetching coupon:', err);
      return null;
    }
  }

  async findByCode(code: string): Promise<Coupon | null> {
    try {
      return await this.couponRepository.findOne({
        where: { code: code.toUpperCase() },
      });
    } catch (err) {
      console.error('Error fetching coupon by code:', err);
      return null;
    }
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon | null> {
    try {
      const coupon = await this.findOne(id);
      if (!coupon) return null;      const updateData: any = { ...updateCouponDto };
      if (updateCouponDto.validFrom) {
        updateData.validFrom = new Date(updateCouponDto.validFrom);
      }
      if (updateCouponDto.validUntil) {
        updateData.validUntil = new Date(updateCouponDto.validUntil);
      }

      Object.assign(coupon, updateData);
      return await this.couponRepository.save(coupon);
    } catch (err) {
      console.error('Error updating coupon:', err);
      return null;
    }
  }
  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.couponRepository.delete(id);
      return (result.affected || 0) > 0;
    } catch (err) {
      console.error('Error deleting coupon:', err);
      return false;
    }
  }

  async findActiveCoupons(options: IPaginationOptions): Promise<Pagination<Coupon> | null> {
    try {
      const queryBuilder = this.couponRepository.createQueryBuilder('coupon')
        .where('coupon.isActive = :isActive', { isActive: true })
        .andWhere('coupon.validFrom <= :now', { now: new Date() })
        .andWhere('coupon.validUntil >= :now', { now: new Date() })
        .orderBy('coupon.createdAt', 'DESC');

      return await paginate<Coupon>(queryBuilder, options);
    } catch (err) {
      console.error('Error fetching active coupons:', err);
      return null;
    }
  }

  async validateCoupon(
    code: string,
    userId: string,
    orderTotal: number,
    orderItems: any[] = []
  ): Promise<CouponValidationResult> {
    try {
      const coupon = await this.findByCode(code);
      if (!coupon) {
        return { isValid: false, reason: 'Coupon not found' };
      }

      if (!coupon.isActive) {
        return { isValid: false, reason: 'Coupon is not active' };
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return { isValid: false, reason: 'Coupon has expired or is not yet valid' };
      }

      if (coupon.minimumOrderAmount && orderTotal < coupon.minimumOrderAmount) {
        return { 
          isValid: false, 
          reason: `Minimum order amount of $${coupon.minimumOrderAmount} required` 
        };
      }

      // Check usage limits
      const userUsageCount = await this.couponUsageRepository.count({
        where: { couponId: coupon.id, userId }
      });

      if (userUsageCount >= coupon.usageLimitPerUser) {
        return { isValid: false, reason: 'You have reached the usage limit for this coupon' };
      }

      if (coupon.usedCount >= coupon.usageLimit) {
        return { isValid: false, reason: 'Coupon usage limit has been reached' };
      }

      const discountAmount = this.calculateDiscountAmount(coupon, orderTotal);

      return {
        isValid: true,
        discountAmount,
        coupon
      };
    } catch (err) {
      console.error('Error validating coupon:', err);
      return { isValid: false, reason: 'Error validating coupon' };
    }
  }

  async applyCoupon(
    couponId: string,
    userId: string,
    orderId: string,
    discountAmount: number
  ): Promise<CouponUsage | null> {
    try {
      // Create usage record
      const usage = this.couponUsageRepository.create({
        couponId,
        userId,
        orderId,
        discountAmount,
      });

      const savedUsage = await this.couponUsageRepository.save(usage);

      // Update coupon used count
      await this.couponRepository.increment({ id: couponId }, 'usedCount', 1);

      return savedUsage;
    } catch (err) {
      console.error('Error applying coupon:', err);
      return null;
    }
  }

  async getCouponUsages(
    couponId: string,
    options: IPaginationOptions
  ): Promise<Pagination<CouponUsage> | null> {
    try {
      const queryBuilder = this.couponUsageRepository
        .createQueryBuilder('usage')
        .leftJoinAndSelect('usage.user', 'user')
        .leftJoinAndSelect('usage.order', 'order')
        .where('usage.couponId = :couponId', { couponId })
        .orderBy('usage.usedAt', 'DESC');

      return await paginate<CouponUsage>(queryBuilder, options);
    } catch (err) {
      console.error('Error fetching coupon usages:', err);
      return null;
    }
  }

  async getUserCoupons(userId: string): Promise<Coupon[]> {
    try {
      const now = new Date();
      return await this.couponRepository
        .createQueryBuilder('coupon')
        .where('coupon.isActive = :isActive', { isActive: true })
        .andWhere('coupon.validFrom <= :now', { now })
        .andWhere('coupon.validUntil >= :now', { now })
        .andWhere('coupon.usedCount < coupon.usageLimit')
        .orderBy('coupon.validUntil', 'ASC')
        .getMany();
    } catch (err) {
      console.error('Error fetching user coupons:', err);
      return [];
    }
  }
  async toggleStatus(id: string): Promise<Coupon | null> {
    try {
      const coupon = await this.findOne(id);
      if (!coupon) return null;

      coupon.isActive = !coupon.isActive;
      return await this.couponRepository.save(coupon);
    } catch (err) {
      console.error('Error toggling coupon status:', err);
      return null;
    }
  }

  async getCouponStats(): Promise<any> {
    try {
      const totalCoupons = await this.couponRepository.count();
      const activeCoupons = await this.couponRepository.count({
        where: { isActive: true }
      });      const expiredCoupons = await this.couponRepository
        .createQueryBuilder('coupon')
        .where('coupon.validUntil < :now', { now: new Date() })
        .getCount();
      const totalUsages = await this.couponUsageRepository.count();
      
      const usageStats = await this.couponUsageRepository
        .createQueryBuilder('usage')
        .select('SUM(usage.discountAmount)', 'totalDiscountAmount')
        .getRawOne();

      return {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsages,
        totalDiscountAmount: parseFloat(usageStats.totalDiscountAmount || '0'),
      };
    } catch (err) {
      console.error('Error fetching coupon stats:', err);
      return {
        totalCoupons: 0,
        activeCoupons: 0,
        expiredCoupons: 0,
        totalUsages: 0,
        totalDiscountAmount: 0,
      };
    }
  }

  private checkProductCategoryApplicability(
    coupon: Coupon,
    productIds: string[],
    categoryIds: string[]
  ): boolean {
    // If no restrictions, coupon applies to all products
    if (!coupon.applicableCategories?.length && !coupon.applicableProducts?.length) {
      // Check exclusions
      if (coupon.excludedProducts?.length) {
        const hasExcludedProduct = productIds.some(pid => coupon.excludedProducts.includes(pid));
        if (hasExcludedProduct) return false;
      }

      if (coupon.excludedCategories?.length) {
        const hasExcludedCategory = categoryIds.some(cid => coupon.excludedCategories.includes(cid));
        if (hasExcludedCategory) return false;
      }

      return true;
    }

    // Check if any product or category is in the applicable list
    let isApplicable = false;

    if (coupon.applicableProducts?.length) {
      isApplicable = productIds.some(pid => coupon.applicableProducts.includes(pid));
    }

    if (!isApplicable && coupon.applicableCategories?.length) {
      isApplicable = categoryIds.some(cid => coupon.applicableCategories.includes(cid));
    }

    return isApplicable;
  }

  private calculateDiscountAmount(coupon: Coupon, orderAmount: number): number {
    switch (coupon.type) {
      case CouponType.PERCENTAGE:
        let discount = (orderAmount * coupon.value) / 100;
        if (coupon.maximumDiscountAmount && discount > coupon.maximumDiscountAmount) {
          discount = coupon.maximumDiscountAmount;
        }
        return parseFloat(discount.toFixed(2));

      case CouponType.FIXED_AMOUNT:
        return Math.min(coupon.value, orderAmount);

      case CouponType.FREE_SHIPPING:
        return 0; // Shipping cost would be handled separately

      default:
        return 0;
    }
  }
}
