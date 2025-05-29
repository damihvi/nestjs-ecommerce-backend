import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping'
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  value: number; // Percentage (0-100) or fixed amount

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minimumOrderAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount: number; // For percentage coupons

  @Column({ default: 1 })
  usageLimit: number; // Total usage limit

  @Column({ default: 1 })
  usageLimitPerUser: number; // Usage limit per user

  @Column({ default: 0 })
  usedCount: number; // Current usage count

  @Column({ type: 'timestamp' })
  validFrom: Date;

  @Column({ type: 'timestamp' })
  validUntil: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true })
  applicableCategories: string[]; // Category IDs

  @Column('simple-array', { nullable: true })
  applicableProducts: string[]; // Product IDs

  @Column('simple-array', { nullable: true })
  excludedCategories: string[]; // Category IDs

  @Column('simple-array', { nullable: true })
  excludedProducts: string[]; // Product IDs

  @Column({ default: false })
  isFirstTimeUserOnly: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
