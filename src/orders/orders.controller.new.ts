import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Rutas públicas
  @Get('public')
  async getUserOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('userId') userId: string,
  ) {
    const orders = await this.ordersService.findByUser(userId, { page, limit });
    return new SuccessResponseDto('Orders retrieved successfully', orders);
  }

  @Get('public/:id')
  async getUserOrder(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    const order = await this.ordersService.findOneByUser(id, userId);
    if (!order) throw new NotFoundException('Order not found');
    return new SuccessResponseDto('Order retrieved successfully', order);
  }

  @Post('public')
  async createOrder(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(dto);
    if (!order) throw new BadRequestException('Failed to create order');
    return new SuccessResponseDto('Order created successfully', order);
  }

  // Rutas administrativas
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ) {
    const orders = await this.ordersService.findAll({ page, limit }, status);
    return new SuccessResponseDto('Orders retrieved successfully', orders);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    if (!order) throw new NotFoundException('Order not found');
    return new SuccessResponseDto('Order retrieved successfully', order);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    const order = await this.ordersService.update(id, dto);
    if (!order) throw new NotFoundException('Order not found');
    return new SuccessResponseDto('Order updated successfully', order);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const order = await this.ordersService.updateStatus(id, status);
    if (!order) throw new NotFoundException('Order not found');
    return new SuccessResponseDto('Order status updated successfully', order);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Put(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const order = await this.ordersService.cancel(id, reason);
    if (!order) throw new NotFoundException('Order not found');
    return new SuccessResponseDto('Order cancelled successfully', order);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body('note') note: string,
  ) {
    const order = await this.ordersService.addNote(id, note);
    if (!order) throw new NotFoundException('Order not found');
    return new SuccessResponseDto('Note added successfully', order);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT)
  @Get('stats')
  async getStats() {
    const stats = await this.ordersService.getStats();
    return new SuccessResponseDto('Order stats retrieved successfully', stats);
  }
}
