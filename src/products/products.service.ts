import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product | null> {
    try {
      const category = await this.categoriesRepository.findOne({ 
        where: { id: createProductDto.categoryId } 
      });
      if (!category) return null;

      const product = this.productsRepository.create({
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        image: createProductDto.image,
        sku: createProductDto.sku,
        brand: createProductDto.brand,
        weight: createProductDto.weight,
        dimensions: createProductDto.dimensions,
        isActive: createProductDto.isActive ?? true,
        category: category,
      });

      return await this.productsRepository.save(product);
    } catch (err) {
      console.error('Error creating product:', err);
      return null;
    }
  }

  async findAll(
    options: IPaginationOptions, 
    categoryId?: string, 
    isActive?: boolean,
    minPrice?: number,
    maxPrice?: number,
    search?: string
  ): Promise<Pagination<Product> | null> {
    try {
      const queryBuilder = this.productsRepository.createQueryBuilder('product');
      queryBuilder.leftJoinAndSelect('product.category', 'category');

      if (categoryId) {
        queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere('product.isActive = :isActive', { isActive });
      }

      if (minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
      }

      if (maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
      }

      if (search) {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search OR product.brand ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      queryBuilder.orderBy('product.createdAt', 'DESC');

      return await paginate<Product>(queryBuilder, options);
    } catch (err) {
      console.error('Error fetching products:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<Product | null> {
    try {
      return await this.productsRepository.findOne({ 
        where: { id }, 
        relations: ['category'] 
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    try {
      const product = await this.findOne(id);
      if (!product) return null;

      if (updateProductDto.categoryId) {
        const category = await this.categoriesRepository.findOne({ 
          where: { id: updateProductDto.categoryId } 
        });
        if (!category) return null;
        product.category = category;
      }

      Object.assign(product, updateProductDto);
      return await this.productsRepository.save(product);
    } catch (err) {
      console.error('Error updating product:', err);
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.productsRepository.delete(id);
      return result.affected !== 0;
    } catch (err) {
      console.error('Error deleting product:', err);
      return false;
    }
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    try {
      const product = await this.findOne(id);
      if (!product) return null;

      product.stock = quantity;
      return await this.productsRepository.save(product);
    } catch (err) {
      console.error('Error updating product stock:', err);
      return null;
    }
  }

  async findByCategory(categoryId: string, options: IPaginationOptions): Promise<Pagination<Product> | null> {
    return this.findAll(options, categoryId, true);
  }

  async findFeatured(options: IPaginationOptions): Promise<Pagination<Product> | null> {
    try {
      const queryBuilder = this.productsRepository.createQueryBuilder('product');
      queryBuilder.leftJoinAndSelect('product.category', 'category');
      queryBuilder.where('product.isActive = :isActive', { isActive: true });
      queryBuilder.orderBy('product.createdAt', 'DESC');
      queryBuilder.limit(10); // Featured products limit

      return await paginate<Product>(queryBuilder, options);
    } catch (err) {
      console.error('Error fetching featured products:', err);
      return null;
    }
  }
}
