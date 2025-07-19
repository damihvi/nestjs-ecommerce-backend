import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      relations: ['category'],
      order: { name: 'ASC' }
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepo.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productRepo.findOne({
      where: { id },
      relations: ['category']
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product | null> {
    const slug = createProductDto.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const product = this.productRepo.create({
      ...createProductDto,
      slug,
      isActive: true
    });

    return this.productRepo.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    const product = await this.findOne(id);
    if (!product) return null;

    if (updateProductDto.name) {
      const slug = updateProductDto.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      Object.assign(updateProductDto, { slug });
    }

    Object.assign(product, updateProductDto);
    return this.productRepo.save(product);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productRepo.delete(id);
    return result.affected > 0;
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    const product = await this.findOne(id);
    if (!product) return null;

    product.stock = Math.max(0, product.stock + quantity);
    return this.productRepo.save(product);
  }
}
