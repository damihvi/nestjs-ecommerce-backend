import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryMovementDto,
  InventoryAdjustmentDto,
  BulkInventoryUpdateDto,
  StockAlertThresholdDto,
  InventoryReportQueryDto,
} from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard, AdminGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('movements')
  async recordMovement(
    @Body() createMovementDto: CreateInventoryMovementDto,
    @GetUser() user: User,
  ) {
    const movement = await this.inventoryService.recordMovement(createMovementDto, user.id);
    if (!movement) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to record inventory movement',
      };
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Inventory movement recorded successfully',
      data: movement,
    };
  }

  @Post('adjust')
  async adjustInventory(
    @Body() adjustmentDto: InventoryAdjustmentDto,
    @GetUser() user: User,
  ) {
    const movement = await this.inventoryService.adjustInventory(adjustmentDto, user.id);
    if (!movement) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to adjust inventory',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory adjusted successfully',
      data: movement,
    };
  }

  @Post('bulk-update')
  async bulkInventoryUpdate(
    @Body() bulkUpdateDto: BulkInventoryUpdateDto,
    @GetUser() user: User,
  ) {
    const movements = await this.inventoryService.bulkInventoryUpdate(bulkUpdateDto, user.id);
    return {
      statusCode: HttpStatus.OK,
      message: `Bulk inventory update completed. ${movements.length} items updated.`,
      data: movements,
    };
  }
  @Get('movements')
  async getInventoryMovements(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
    @Query('movementType') movementType?: string,
    @Query('reason') reason?: string,
  ) {
    const options = {
      page,
      limit,
      route: '/inventory/movements',
    };    const filters: InventoryReportQueryDto = {
      startDate,
      endDate,
      productId: productId && productId !== '0' ? productId : undefined,
      movementType: movementType as any,
      reason: reason as any,
    };

    const movements = await this.inventoryService.getInventoryMovements(options, filters);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory movements retrieved successfully',
      data: movements,
    };
  }
  @Get('products/:productId/movements')
  async getProductMovements(
    @Param('productId') productId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const options = {
      page,
      limit,
      route: `/inventory/products/${productId}/movements`,
    };

    const movements = await this.inventoryService.getProductMovements(productId, options);
    return {
      statusCode: HttpStatus.OK,
      message: 'Product inventory movements retrieved successfully',
      data: movements,
    };
  }
  @Get('products/:productId/history')
  async getStockHistory(
    @Param('productId') productId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const history = await this.inventoryService.getStockHistory(productId, days);
    return {
      statusCode: HttpStatus.OK,
      message: 'Stock history retrieved successfully',
      data: history,
    };
  }

  @Post('alerts/threshold')
  async setStockAlertThreshold(@Body() thresholdDto: StockAlertThresholdDto) {
    const success = await this.inventoryService.setStockAlertThreshold(thresholdDto);
    if (!success) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to set stock alert threshold',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Stock alert threshold set successfully',
    };
  }

  @Get('alerts')
  async getActiveAlerts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const options = {
      page,
      limit,
      route: '/inventory/alerts',
    };

    const alerts = await this.inventoryService.getActiveAlerts(options);
    return {
      statusCode: HttpStatus.OK,
      message: 'Active alerts retrieved successfully',
      data: alerts,
    };
  }

  @Put('alerts/:alertId/dismiss')
  async dismissAlert(@Param('alertId', ParseIntPipe) alertId: number) {
    const success = await this.inventoryService.dismissAlert(alertId);
    if (!success) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Alert not found',
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Alert dismissed successfully',
    };
  }

  @Get('low-stock')
  async getLowStockProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const options = {
      page,
      limit,
      route: '/inventory/low-stock',
    };

    const products = await this.inventoryService.getLowStockProducts(options);
    return {
      statusCode: HttpStatus.OK,
      message: 'Low stock products retrieved successfully',
      data: products,
    };
  }

  @Get('value')
  async getInventoryValue() {
    const value = await this.inventoryService.getInventoryValue();
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory value retrieved successfully',
      data: value,
    };
  }
  @Get('report')
  async getInventoryReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
    @Query('movementType') movementType?: string,
    @Query('reason') reason?: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
  ) {
    const filters: InventoryReportQueryDto = {
      startDate,
      endDate,
      productId: productId && productId !== '0' ? productId : undefined,
      movementType: movementType as any,
      reason: reason as any,
      limit,
    };

    const report = await this.inventoryService.getInventoryReport(filters);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory report generated successfully',
      data: report,
    };
  }
}
