import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('stock_alerts')
@Unique(['product'])
@Index(['alertType', 'isActive'])
export class StockAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;
  @Column({ name: 'product_id' })
  productId: string;

  @Column({
    type: 'enum',
    enum: ['low_stock', 'out_of_stock', 'overstock'],
    name: 'alert_type',
  })
  alertType: 'low_stock' | 'out_of_stock' | 'overstock';

  @Column({ type: 'int', name: 'threshold_quantity' })
  thresholdQuantity: number;

  @Column({ type: 'int', name: 'current_quantity' })
  currentQuantity: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'last_triggered_at', nullable: true })
  lastTriggeredAt: Date;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
