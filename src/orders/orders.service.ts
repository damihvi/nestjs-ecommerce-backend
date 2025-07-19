import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';

export interface CreateOrderDto {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, items } = createOrderDto;

    // Crear la orden
    const order = this.orderRepo.create({
      userId,
      status: 'pending',
      total: 0
    });

    const savedOrder = await this.orderRepo.save(order);

    // Crear los items y calcular total
    let total = 0;
    for (const item of items) {
      const product = await this.productRepo.findOne({ where: { id: item.productId } });
      if (!product) continue;

      const subtotal = parseFloat(product.price.toString()) * item.quantity;
      total += subtotal;

      // Actualizar stock
      product.stock -= item.quantity;
      await this.productRepo.save(product);

      // Crear item
      const orderItem = this.orderItemRepo.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });
      await this.orderItemRepo.save(orderItem);
    }

    // Actualizar total de la orden
    savedOrder.total = total;
    return this.orderRepo.save(savedOrder);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Order> {
    return this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product']
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    await this.orderRepo.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.orderRepo.delete(id);
  }
}
