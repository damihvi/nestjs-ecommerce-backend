import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Order, OrderStatus, PaymentStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order | null> {
    try {
      // Verify user exists
      const user = await this.userRepository.findOne({ where: { id: createOrderDto.userId } });
      if (!user) return null;

      // Calculate order totals
      let subtotal = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productRepository.findOne({ where: { id: item.productId } });
        if (!product || !product.isActive) return null;
        
        // Check stock availability
        if (product.stock < item.quantity) return null;

        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });
      }

      // Calculate tax and shipping (you can customize these calculations)
      const taxRate = 0.08; // 8% tax
      const taxAmount = subtotal * taxRate;
      const shippingCost = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
      const totalAmount = subtotal + taxAmount + shippingCost;

      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Create order
      const order = this.orderRepository.create({
        orderNumber,
        userId: user.id,
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
        paymentMethod: createOrderDto.paymentMethod,
        shippingName: createOrderDto.shippingName,
        shippingEmail: createOrderDto.shippingEmail,
        shippingPhone: createOrderDto.shippingPhone,
        shippingAddress: createOrderDto.shippingAddress,
        shippingCity: createOrderDto.shippingCity,
        shippingPostalCode: createOrderDto.shippingPostalCode,
        shippingCountry: createOrderDto.shippingCountry,
        notes: createOrderDto.notes,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Create order items
      for (const itemData of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...itemData,
          orderId: savedOrder.id,
        });
        await this.orderItemRepository.save(orderItem);        // Update product stock
        await this.productRepository.decrement(
          { id: itemData.productId },
          'stock',
          itemData.quantity || 0
        );
      }

      return this.findOne(savedOrder.id);
    } catch (err) {
      console.error('Error creating order:', err);
      return null;
    }
  }

  async findAll(
    options: IPaginationOptions,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
    userId?: string
  ): Promise<Pagination<Order> | null> {
    try {
      const queryBuilder = this.orderRepository.createQueryBuilder('order');
      queryBuilder.leftJoinAndSelect('order.user', 'user');
      queryBuilder.leftJoinAndSelect('order.items', 'items');
      queryBuilder.leftJoinAndSelect('items.product', 'product');

      if (status) {
        queryBuilder.andWhere('order.status = :status', { status });
      }

      if (paymentStatus) {
        queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
      }

      if (userId) {
        queryBuilder.andWhere('order.userId = :userId', { userId });
      }

      queryBuilder.orderBy('order.createdAt', 'DESC');

      return await paginate<Order>(queryBuilder, options);
    } catch (err) {
      console.error('Error fetching orders:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne({
        where: { id },
        relations: ['user', 'items', 'items.product'],
      });
    } catch (err) {
      console.error('Error fetching order:', err);
      return null;
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      return await this.orderRepository.findOne({
        where: { orderNumber },
        relations: ['user', 'items', 'items.product'],
      });
    } catch (err) {
      console.error('Error fetching order by number:', err);
      return null;
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order | null> {
    try {
      const order = await this.findOne(id);
      if (!order) return null;

      Object.assign(order, updateOrderDto);

      // Update timestamps based on status changes
      if (updateOrderDto.status === OrderStatus.SHIPPED && !order.shippedAt) {
        order.shippedAt = new Date();
      }

      if (updateOrderDto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }

      return await this.orderRepository.save(order);
    } catch (err) {
      console.error('Error updating order:', err);
      return null;
    }
  }

  async cancel(id: string): Promise<Order | null> {
    try {
      const order = await this.findOne(id);
      if (!order) return null;

      // Only allow cancellation if order is not shipped
      if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
        return null;
      }

      // Restore product stock
      for (const item of order.items) {
        await this.productRepository.increment(
          { id: item.productId },
          'stock',
          item.quantity
        );
      }

      order.status = OrderStatus.CANCELLED;
      return await this.orderRepository.save(order);
    } catch (err) {
      console.error('Error cancelling order:', err);
      return null;
    }
  }

  async getUserOrderStats(userId: string): Promise<any> {
    try {
      const totalOrders = await this.orderRepository.count({
        where: { userId }
      });

      const totalSpent = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalAmount)', 'total')
        .where('order.userId = :userId', { userId })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
        .getRawOne();

      const recentOrders = await this.orderRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['items', 'items.product']
      });

      return {
        totalOrders,
        totalSpent: parseFloat(totalSpent?.total || '0'),
        recentOrders
      };
    } catch (err) {
      console.error('Error getting user order stats:', err);
      return null;
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }
}
