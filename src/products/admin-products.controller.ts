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
  ParseUUIDPipe 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions, Permission } from '../common/guards/permissions.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// DTOs para operaciones avanzadas
interface BulkUpdateProductDto {
  productIds: string[];
  updates: Partial<UpdateProductDto>;
}

interface PriceUpdateDto {
  categoryId: string;
  percentage: number;
}

interface DiscountDto {
  productIds: string[];
  discountPercentage: number;
}

interface InventoryAdjustmentDto {
  productId: string;
  quantity: number;
  reason: 'restock' | 'damage' | 'sold' | 'correction' | 'other';
  notes?: string;
}

@Controller('admin/products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // === OPERACIONES BÁSICAS ===

  @Get()
  @RequirePermissions(Permission.PRODUCTS_READ)
  async getAllProducts() {
    // Obtener todos los productos sin paginación para funciones admin
    const products = await this.productsService.findAll({ page: 1, limit: 1000 });
    return {
      statusCode: HttpStatus.OK,
      message: 'Productos obtenidos exitosamente',
      data: { items: products?.items || [] }
    };
  }

  @Post()
  @RequirePermissions(Permission.PRODUCTS_CREATE)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Producto creado exitosamente',
      data: product
    };
  }

  @Put(':id')
  @RequirePermissions(Permission.PRODUCTS_UPDATE)
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Producto actualizado exitosamente',
      data: product
    };
  }

  @Delete(':id')
  @RequirePermissions(Permission.PRODUCTS_DELETE)
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    await this.productsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Producto eliminado exitosamente'
    };
  }

  // === OPERACIONES MASIVAS ===

  @Post('bulk-update')
  @RequirePermissions(Permission.PRODUCTS_BULK_OPERATIONS)
  async bulkUpdateProducts(
    @Body() bulkUpdateDto: BulkUpdateProductDto,
    @GetUser() user: User
  ) {
    const { productIds, updates } = bulkUpdateDto;
    
    const updatePromises = productIds.map(id => 
      this.productsService.update(id, updates)
    );
    
    const updatedProducts = await Promise.all(updatePromises);
    
    // Log de auditoría
    console.log(`Admin ${user.username} realizó actualización masiva en ${productIds.length} productos`);
    
    return {
      statusCode: HttpStatus.OK,
      message: `${updatedProducts.length} productos actualizados exitosamente`,
      data: updatedProducts
    };
  }

  @Post('bulk-delete')
  @RequirePermissions(Permission.PRODUCTS_DELETE, Permission.PRODUCTS_BULK_OPERATIONS)
  async bulkDeleteProducts(
    @Body() { productIds }: { productIds: string[] },
    @GetUser() user: User
  ) {
    const deletePromises = productIds.map(id => 
      this.productsService.remove(id)
    );
    
    await Promise.all(deletePromises);
    
    // Log de auditoría
    console.log(`Admin ${user.username} eliminó ${productIds.length} productos en masa`);
    
    return {
      statusCode: HttpStatus.OK,
      message: `${productIds.length} productos eliminados exitosamente`
    };
  }

  // === GESTIÓN DE PRECIOS ===

  @Post('update-prices-by-category')
  @RequirePermissions(Permission.PRODUCTS_UPDATE, Permission.PRODUCTS_BULK_OPERATIONS)
  async updatePricesByCategory(
    @Body() priceUpdateDto: PriceUpdateDto,
    @GetUser() user: User
  ) {
    const { categoryId, percentage } = priceUpdateDto;
    
    // Obtener productos de la categoría
    const products = await this.productsService.findAll({ page: 1, limit: 1000 }, categoryId);
    
    if (!products || !products.items) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'No se encontraron productos en esta categoría'
      };
    }
    
    // Actualizar precios
    const updatePromises = products.items.map(product => {
      const newPrice = product.price * (1 + percentage / 100);
      return this.productsService.update(product.id, { price: newPrice });
    });
    
    const updatedProducts = await Promise.all(updatePromises);
    
    // Log de auditoría
    console.log(`Admin ${user.username} actualizó precios en categoría ${categoryId} con ${percentage}%`);
    
    return {
      statusCode: HttpStatus.OK,
      message: `Precios actualizados en ${updatedProducts.length} productos`,
      data: updatedProducts
    };
  }

  @Post('apply-discount')
  @RequirePermissions(Permission.PRODUCTS_UPDATE, Permission.PRODUCTS_BULK_OPERATIONS)
  async applyDiscount(
    @Body() discountDto: DiscountDto,
    @GetUser() user: User
  ) {
    const { productIds, discountPercentage } = discountDto;
    
    // Aplicar descuento
    const updatePromises = productIds.map(async (id) => {
      const product = await this.productsService.findOne(id);
      if (!product) return null;
      
      const newPrice = product.price * (1 - discountPercentage / 100);
      return this.productsService.update(id, { price: newPrice });
    });
    
    const updatedProducts = await Promise.all(updatePromises);
    const validUpdates = updatedProducts.filter(p => p !== null);
    
    // Log de auditoría
    console.log(`Admin ${user.username} aplicó descuento de ${discountPercentage}% a ${productIds.length} productos`);
    
    return {
      statusCode: HttpStatus.OK,
      message: `Descuento de ${discountPercentage}% aplicado a ${validUpdates.length} productos`,
      data: validUpdates
    };
  }

  // === GESTIÓN DE INVENTARIO ===

  @Post('adjust-inventory')
  @RequirePermissions(Permission.INVENTORY_UPDATE)
  async adjustInventory(
    @Body() inventoryDto: InventoryAdjustmentDto,
    @GetUser() user: User
  ) {
    const { productId, quantity, reason, notes } = inventoryDto;
    
    const product = await this.productsService.findOne(productId);
    if (!product) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Producto no encontrado'
      };
    }
    
    const newStock = Math.max(0, product.stock + quantity);
    
    const updatedProduct = await this.productsService.update(productId, { 
      stock: newStock 
    });
    
    // Log de auditoría
    console.log(`Admin ${user.username} ajustó inventario del producto ${productId}: ${quantity} unidades (${reason})`);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventario ajustado exitosamente',
      data: {
        product: updatedProduct,
        previousStock: product.stock,
        newStock,
        adjustment: quantity,
        reason,
        notes
      }
    };
  }

  // === ANALYTICS BÁSICOS ===

  @Get('analytics')
  @RequirePermissions(Permission.ANALYTICS_VIEW)
  async getBasicAnalytics() {
    const products = await this.productsService.findAll({ page: 1, limit: 10000 });
    
    if (!products || !products.items) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Analytics obtenidos exitosamente',
        data: {
          totalProducts: 0,
          activeProducts: 0,
          totalValue: 0,
          averagePrice: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0
        }
      };
    }
    
    const allProducts = products.items;
    
    // Cálculos básicos
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(p => p.isActive).length;
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const averagePrice = totalProducts > 0 ? 
      allProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;
    
    // Stock analysis
    const lowStockProducts = allProducts.filter(p => p.stock <= 10 && p.stock > 0).length;
    const outOfStockProducts = allProducts.filter(p => p.stock === 0).length;
    
    const analytics = {
      totalProducts,
      activeProducts,
      totalValue,
      averagePrice,
      lowStockProducts,
      outOfStockProducts
    };
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Analytics obtenidos exitosamente',
      data: analytics
    };
  }

  @Get('low-stock')
  @RequirePermissions(Permission.INVENTORY_READ)
  async getLowStockProducts(@Query('threshold') threshold: number = 10) {
    const products = await this.productsService.findAll({ page: 1, limit: 1000 });
    
    if (!products || !products.items) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Productos con stock bajo obtenidos exitosamente',
        data: []
      };
    }
    
    const lowStockProducts = products.items.filter(p => p.stock <= threshold && p.stock > 0);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Productos con stock bajo obtenidos exitosamente',
      data: lowStockProducts
    };
  }

  @Get('out-of-stock')
  @RequirePermissions(Permission.INVENTORY_READ)
  async getOutOfStockProducts() {
    const products = await this.productsService.findAll({ page: 1, limit: 1000 });
    
    if (!products || !products.items) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Productos agotados obtenidos exitosamente',
        data: []
      };
    }
    
    const outOfStockProducts = products.items.filter(p => p.stock === 0);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Productos agotados obtenidos exitosamente',
      data: outOfStockProducts
    };
  }

  // === IMPORTACIÓN / EXPORTACIÓN ===

  @Post('import')
  @RequirePermissions(Permission.PRODUCTS_CREATE, Permission.PRODUCTS_BULK_OPERATIONS)
  async importProducts(
    @Body() { products }: { products: CreateProductDto[] },
    @GetUser() user: User
  ) {
    const createdProducts = await Promise.all(
      products.map(productDto => this.productsService.create(productDto))
    );
    
    const validProducts = createdProducts.filter(p => p !== null);
    
    // Log de auditoría
    console.log(`Admin ${user.username} importó ${validProducts.length} productos`);
    
    return {
      statusCode: HttpStatus.CREATED,
      message: `${validProducts.length} productos importados exitosamente`,
      data: validProducts
    };
  }

  @Get('export')
  @RequirePermissions(Permission.PRODUCTS_READ)
  async exportProducts() {
    const products = await this.productsService.findAll({ page: 1, limit: 10000 });
    
    if (!products || !products.items) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Productos exportados exitosamente',
        data: []
      };
    }
    
    // Formato para exportación
    const exportData = products.items.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      brand: product.brand,
      category: product.category?.name,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Productos exportados exitosamente',
      data: exportData
    };
  }

  // === LOGS DE AUDITORÍA ===

  @Get('audit-logs')
  @RequirePermissions(Permission.SYSTEM_LOGS)
  async getAuditLogs(@Query('limit') limit: number = 50) {
    // En una implementación real, esto vendría de una tabla de auditoría
    const mockLogs = [
      {
        id: '1',
        action: 'PRODUCT_CREATED',
        entityId: 'product-123',
        entityName: 'Nuevo Producto',
        userId: 'admin-1',
        username: 'admin',
        timestamp: new Date(),
        details: { name: 'Nuevo Producto', price: 100 }
      },
      {
        id: '2',
        action: 'BULK_PRICE_UPDATE',
        entityId: 'category-electronics',
        entityName: 'Categoría Electrónicos',
        userId: 'admin-1',
        username: 'admin',
        timestamp: new Date(Date.now() - 3600000),
        details: { percentage: 10, affectedProducts: 25 }
      },
      {
        id: '3',
        action: 'INVENTORY_ADJUSTMENT',
        entityId: 'product-456',
        entityName: 'Producto XYZ',
        userId: 'admin-1',
        username: 'admin',
        timestamp: new Date(Date.now() - 7200000),
        details: { adjustment: 50, reason: 'restock' }
      }
    ];
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Logs de auditoría obtenidos exitosamente',
      data: mockLogs.slice(0, limit)
    };
  }
}
