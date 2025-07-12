import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum EventType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  SEARCH = 'search',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  PURCHASE = 'purchase',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  WISHLIST_ADD = 'wishlist_add',
  WISHLIST_REMOVE = 'wishlist_remove',
  REVIEW_CREATED = 'review_created',
  COUPON_USED = 'coupon_used'
}

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EventType })
  event: EventType;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  referrer: string;

  @Column({ nullable: true })
  page: string;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
