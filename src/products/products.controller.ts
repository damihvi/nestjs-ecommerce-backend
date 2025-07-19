import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, NotFoundException, BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query('categoryId') categoryId?: string) {
    try {
      let products;
      if (categoryId) {
        products = await this.productsService.findByCategory(categoryId);
      } else {
        products = await this.productsService.findAll();
      }

      return {
        success: true,
        message: 'Products retrieved successfully',
        data: products,
        count: products.length
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new InternalServerErrorException('Failed to retrieve products');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Product ID is required');
    }

    try {
      const product = await this.productsService.findOne(id);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }
      return {
        success: true,
        message: 'Product retrieved successfully',
        data: product
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching product:', error);
      throw new InternalServerErrorException('Failed to retrieve product');
    }
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    if (!createProductDto.name || createProductDto.name.trim() === '') {
      throw new BadRequestException('Product name is required');
    }
    if (!createProductDto.price || createProductDto.price <= 0) {
      throw new BadRequestException('Valid price is required');
    }
    if (!createProductDto.categoryId) {
      throw new BadRequestException('Category ID is required');
    }

    try {
      const product = await this.productsService.create(createProductDto);
      if (!product) {
        throw new InternalServerErrorException('Failed to create product');
      }
      return {
        success: true,
        message: 'Product created successfully',
        data: product
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Product ID is required');
    }

    if (Object.keys(updateProductDto).length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    if (updateProductDto.price !== undefined && updateProductDto.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    try {
      const product = await this.productsService.update(id, updateProductDto);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }
      return {
        success: true,
        message: 'Product updated successfully',
        data: product
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating product:', error);
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Product ID is required');
    }

    try {
      const success = await this.productsService.delete(id);
      if (!success) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }
      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting product:', error);
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  @Put(':id/stock')
  async updateStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('Product ID is required');
    }
    if (body.quantity === undefined || typeof body.quantity !== 'number') {
      throw new BadRequestException('Valid quantity is required');
    }

    try {
      const product = await this.productsService.updateStock(id, body.quantity);
      if (!product) {
        throw new NotFoundException(`Product with ID '${id}' not found`);
      }
      return {
        success: true,
        message: 'Stock updated successfully',
        data: product
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating stock:', error);
      throw new InternalServerErrorException('Failed to update stock');
    }
  }
}
