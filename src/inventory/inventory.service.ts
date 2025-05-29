import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { InventoryMovement, MovementType, MovementReason } from './inventory-movement.entity';
import { StockAlert } from './stock-alert.entity';
import { Product } from '../products/product.entity';
import {
  CreateInventoryMovementDto,
  InventoryAdjustmentDto,
  BulkInventoryUpdateDto,
  StockAlertThresholdDto,
  InventoryReportQueryDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private inventoryMovementRepository: Repository<InventoryMovement>,
    @InjectRepository(StockAlert)
    private stockAlertRepository: Repository<StockAlert>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}
  async recordMovement(
    createMovementDto: CreateInventoryMovementDto,
    userId?: string,
  ): Promise<InventoryMovement | null> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: createMovementDto.productId },
      });

      if (!product) return null;

      const previousStock = product.stock;
      let newStock: number;

      // Calculate new stock based on movement type
      switch (createMovementDto.movementType) {
        case MovementType.PURCHASE:
        case MovementType.RETURN:
          newStock = previousStock + Math.abs(createMovementDto.quantity);
          break;
        case MovementType.SALE:
        case MovementType.DAMAGED:
        case MovementType.EXPIRED:
          newStock = Math.max(0, previousStock - Math.abs(createMovementDto.quantity));
          break;
        case MovementType.ADJUSTMENT:
          newStock = Math.max(0, previousStock + createMovementDto.quantity);
          break;
        case MovementType.TRANSFER:
          newStock = Math.max(0, previousStock - Math.abs(createMovementDto.quantity));
          break;
        default:
          newStock = previousStock;
      }

      // Create inventory movement record
      const movement = this.inventoryMovementRepository.create({
        ...createMovementDto,
        previousStock,
        newStock,
        createdById: userId,
      });

      const savedMovement = await this.inventoryMovementRepository.save(movement);

      // Update product stock
      await this.productRepository.update(product.id, { stock: newStock });

      // Check and update stock alerts
      await this.checkStockAlerts(product.id, newStock);

      return savedMovement;
    } catch (error) {
      console.error('Error recording inventory movement:', error);
      return null;
    }
  }
  async adjustInventory(
    adjustmentDto: InventoryAdjustmentDto,
    userId?: string,
  ): Promise<InventoryMovement | null> {
    const product = await this.productRepository.findOne({
      where: { id: adjustmentDto.productId },
    });

    if (!product) return null;

    const quantityDifference = adjustmentDto.newQuantity - product.stock;

    const movementDto: CreateInventoryMovementDto = {
      productId: adjustmentDto.productId,
      movementType: MovementType.ADJUSTMENT,
      reason: adjustmentDto.reason,
      quantity: quantityDifference,
      notes: adjustmentDto.notes,
    };

    return await this.recordMovement(movementDto, userId);
  }
  async bulkInventoryUpdate(
    bulkUpdateDto: BulkInventoryUpdateDto,
    userId?: string,
  ): Promise<InventoryMovement[]> {
    const movements: InventoryMovement[] = [];

    for (const adjustment of bulkUpdateDto.adjustments) {
      const movement = await this.adjustInventory(adjustment, userId);
      if (movement) {
        movements.push(movement);
      }
    }

    return movements;
  }

  async getInventoryMovements(
    options: IPaginationOptions,
    filters?: InventoryReportQueryDto,
  ): Promise<Pagination<InventoryMovement>> {
    const queryBuilder = this.inventoryMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.createdBy', 'user')
      .orderBy('movement.createdAt', 'DESC');

    if (filters) {
      if (filters.startDate) {
        queryBuilder.andWhere('movement.createdAt >= :startDate', {
          startDate: new Date(filters.startDate),
        });
      }

      if (filters.endDate) {
        queryBuilder.andWhere('movement.createdAt <= :endDate', {
          endDate: new Date(filters.endDate),
        });
      }

      if (filters.productId) {
        queryBuilder.andWhere('movement.productId = :productId', {
          productId: filters.productId,
        });
      }

      if (filters.movementType) {
        queryBuilder.andWhere('movement.movementType = :movementType', {
          movementType: filters.movementType,
        });
      }

      if (filters.reason) {
        queryBuilder.andWhere('movement.reason = :reason', {
          reason: filters.reason,
        });
      }
    }

    return paginate<InventoryMovement>(queryBuilder, options);
  }
  async getProductMovements(
    productId: string,
    options: IPaginationOptions,
  ): Promise<Pagination<InventoryMovement>> {
    const queryBuilder = this.inventoryMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.createdBy', 'user')
      .where('movement.productId = :productId', { productId })
      .orderBy('movement.createdAt', 'DESC');

    return paginate<InventoryMovement>(queryBuilder, options);
  }

  async setStockAlertThreshold(thresholdDto: StockAlertThresholdDto): Promise<boolean> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: thresholdDto.productId },
      });

      if (!product) return false;

      // Remove existing alerts for this product
      await this.stockAlertRepository.delete({ productId: thresholdDto.productId });

      // Create new low stock alert if threshold is set
      if (thresholdDto.lowStockThreshold > 0) {
        const lowStockAlert = this.stockAlertRepository.create({
          productId: thresholdDto.productId,
          alertType: 'low_stock',
          thresholdQuantity: thresholdDto.lowStockThreshold,
          currentQuantity: product.stock,
          isActive: true,
        });
        await this.stockAlertRepository.save(lowStockAlert);
      }

      // Create overstock alert if threshold is set
      if (thresholdDto.overstockThreshold && thresholdDto.overstockThreshold > 0) {
        const overstockAlert = this.stockAlertRepository.create({
          productId: thresholdDto.productId,
          alertType: 'overstock',
          thresholdQuantity: thresholdDto.overstockThreshold,
          currentQuantity: product.stock,
          isActive: true,
        });
        await this.stockAlertRepository.save(overstockAlert);
      }

      // Check alerts with current stock
      await this.checkStockAlerts(thresholdDto.productId, product.stock);

      return true;
    } catch (error) {
      console.error('Error setting stock alert threshold:', error);
      return false;
    }
  }

  async checkStockAlerts(productId: string, currentStock: number): Promise<void> {
    try {
      const alerts = await this.stockAlertRepository.find({
        where: { productId, isActive: true },
      });

      for (const alert of alerts) {
        let shouldTrigger = false;
        let message = '';

        switch (alert.alertType) {
          case 'low_stock':
            if (currentStock <= alert.thresholdQuantity) {
              shouldTrigger = true;
              message = `Low stock alert: ${currentStock} units remaining (threshold: ${alert.thresholdQuantity})`;
            }
            break;
          case 'out_of_stock':
            if (currentStock === 0) {
              shouldTrigger = true;
              message = 'Out of stock alert: Product is out of stock';
            }
            break;
          case 'overstock':
            if (currentStock >= alert.thresholdQuantity) {
              shouldTrigger = true;
              message = `Overstock alert: ${currentStock} units available (threshold: ${alert.thresholdQuantity})`;
            }
            break;
        }

        // Update alert
        await this.stockAlertRepository.update(alert.id, {
          currentQuantity: currentStock,
          lastTriggeredAt: shouldTrigger ? new Date() : alert.lastTriggeredAt,
          message: shouldTrigger ? message : alert.message,
        });
      }
    } catch (error) {
      console.error('Error checking stock alerts:', error);
    }
  }

  async getActiveAlerts(options: IPaginationOptions): Promise<Pagination<StockAlert>> {
    const queryBuilder = this.stockAlertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.product', 'product')
      .where('alert.isActive = :isActive', { isActive: true })
      .andWhere('alert.lastTriggeredAt IS NOT NULL')
      .orderBy('alert.lastTriggeredAt', 'DESC');

    return paginate<StockAlert>(queryBuilder, options);
  }

  async getLowStockProducts(options: IPaginationOptions): Promise<Pagination<Product>> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.stockAlerts', 'alert')
      .where('alert.alertType = :alertType', { alertType: 'low_stock' })
      .andWhere('product.stock <= alert.thresholdQuantity')
      .andWhere('alert.isActive = :isActive', { isActive: true })
      .orderBy('product.stock', 'ASC');

    return paginate<Product>(queryBuilder, options);
  }

  async getInventoryValue(): Promise<{ totalValue: number; totalProducts: number }> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.price * product.stock)', 'totalValue')
      .addSelect('COUNT(product.id)', 'totalProducts')
      .where('product.stock > 0')
      .getRawOne();

    return {
      totalValue: parseFloat(result.totalValue) || 0,
      totalProducts: parseInt(result.totalProducts) || 0,
    };
  }

  async getInventoryReport(filters?: InventoryReportQueryDto) {
    const movements = await this.getInventoryMovements(
      { page: 1, limit: filters?.limit || 100 },
      filters,
    );

    const lowStockProducts = await this.getLowStockProducts({ page: 1, limit: 10 });
    const inventoryValue = await this.getInventoryValue();
    const activeAlerts = await this.getActiveAlerts({ page: 1, limit: 10 });

    return {
      movements,
      lowStockProducts,
      inventoryValue,
      activeAlerts,
      summary: {
        totalMovements: movements.meta.totalItems,
        lowStockCount: lowStockProducts.meta.totalItems,
        activeAlertsCount: activeAlerts.meta.totalItems,
      },
    };
  }
  async getStockHistory(
    productId: string,
    days: number = 30,
  ): Promise<{ date: string; stock: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const movements = await this.inventoryMovementRepository.find({
      where: {
        productId,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    const history: { date: string; stock: number }[] = [];
    const dateMap = new Map<string, number>();

    // Build stock history from movements
    for (const movement of movements) {
      const dateKey = movement.createdAt.toISOString().split('T')[0];
      dateMap.set(dateKey, movement.newStock);
    }

    // Fill in the history array
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      history.unshift({
        date: dateKey,
        stock: dateMap.get(dateKey) || history[0]?.stock || 0,
      });
    }

    return history;
  }
  async dismissAlert(alertId: number): Promise<boolean> {
    try {
      const result = await this.stockAlertRepository.update(alertId, {
        isActive: false,
      });
      return (result.affected || 0) > 0;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return false;
    }
  }
}
