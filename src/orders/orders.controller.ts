import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { OrderStatus, PaymentStatus } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    if (!order) {
      throw new BadRequestException('Failed to create order. Check product availability and user ID.');
    }
    return new SuccessResponseDto('Order created successfully', order);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('userId') userId?: string,
  ) {
    const result = await this.ordersService.findAll(
      { page, limit },
      status,
      paymentStatus,
      userId
    );

    if (!result) {
      throw new InternalServerErrorException('Could not retrieve orders');
    }

    return new SuccessResponseDto('Orders retrieved successfully', result);
  }

  @Get('user/:userId/stats')
  async getUserOrderStats(@Param('userId') userId: string) {
    const stats = await this.ordersService.getUserOrderStats(userId);
    if (!stats) {
      throw new InternalServerErrorException('Could not retrieve user order statistics');
    }
    return new SuccessResponseDto('User order statistics retrieved successfully', stats);
  }

  @Get('number/:orderNumber')
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    const order = await this.ordersService.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return new SuccessResponseDto('Order retrieved successfully', order);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return new SuccessResponseDto('Order retrieved successfully', order);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersService.update(id, updateOrderDto);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return new SuccessResponseDto('Order updated successfully', order);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string) {
    const order = await this.ordersService.cancel(id);
    if (!order) {
      throw new BadRequestException('Order not found or cannot be cancelled');
    }
    return new SuccessResponseDto('Order cancelled successfully', order);
  }
}
