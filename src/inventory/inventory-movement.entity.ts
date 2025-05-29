import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

export enum MovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  TRANSFER = 'transfer',
}

export enum MovementReason {
  INITIAL_STOCK = 'initial_stock',
  RESTOCK = 'restock',
  ORDER_SALE = 'order_sale',
  ORDER_CANCELLATION = 'order_cancellation',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
  DAMAGED_GOODS = 'damaged_goods',
  EXPIRED_GOODS = 'expired_goods',
  CUSTOMER_RETURN = 'customer_return',
  SUPPLIER_RETURN = 'supplier_return',
  INVENTORY_COUNT = 'inventory_count',
}

@Entity('inventory_movements')
@Index(['product', 'createdAt'])
@Index(['movementType', 'createdAt'])
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;
  @Column({ name: 'product_id' })
  productId: string;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  movementType: MovementType;

  @Column({
    type: 'enum',
    enum: MovementReason,
  })
  reason: MovementReason;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', name: 'previous_stock' })
  previousStock: number;

  @Column({ type: 'int', name: 'new_stock' })
  newStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string; // Order ID, Return ID, etc.

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string; // 'order', 'return', 'adjustment', etc.

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
