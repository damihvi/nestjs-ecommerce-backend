import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { StockAlert } from '../inventory/stock-alert.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  image?: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('text', { nullable: true })
  imageDetails: string; // JSON string for image metadata

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  sku: string; // Stock Keeping Unit

  @Column({ nullable: true })
  brand: string;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  weight: number; // in kg

  @Column({ nullable: true })
  dimensions: string; // e.g., "10x20x30 cm"

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @OneToMany(() => StockAlert, stockAlert => stockAlert.product)
  stockAlerts: StockAlert[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
