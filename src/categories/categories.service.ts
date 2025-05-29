import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category | null> {
    try {
      // Generate slug if not provided
      if (!dto.slug && dto.name) {
        dto.slug = dto.name.toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      }

      const category = this.categoryRepo.create(dto);
      return await this.categoryRepo.save(category);
    } catch (err) {
      console.error('Error creating category:', err);
      return null;
    }
  }

  async findAll(options: IPaginationOptions, isActive?: boolean): Promise<Pagination<Category> | null> {
    try {
      const query = this.categoryRepo.createQueryBuilder('category');
      
      if (isActive !== undefined) {
        query.where('category.isActive = :isActive', { isActive });
      }
      
      query.orderBy('category.name', 'ASC');
      
      return await paginate<Category>(query, options);
    } catch (err) {
      console.error('Error retrieving categories:', err);
      return null;
    }
  }

  async findOne(id: string): Promise<Category | null> {
    try {
      return await this.categoryRepo.findOne({ where: { id } });
    } catch (err) {
      console.error('Error finding category:', err);
      return null;
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      return await this.categoryRepo.findOne({ where: { slug, isActive: true } });
    } catch (err) {
      console.error('Error finding category by slug:', err);
      return null;
    }
  }

  async findActive(): Promise<Category[]> {
    try {
      return await this.categoryRepo.find({ 
        where: { isActive: true },
        order: { name: 'ASC' }
      });
    } catch (err) {
      console.error('Error finding active categories:', err);
      return [];
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category | null> {
    try {
      const category = await this.findOne(id);
      if (!category) return null;

      // Update slug if name is being updated and slug is not provided
      if (dto.name && !dto.slug) {
        dto.slug = dto.name.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      Object.assign(category, dto);
      return await this.categoryRepo.save(category);
    } catch (err) {
      console.error('Error updating category:', err);
      return null;
    }
  }

  async remove(id: string): Promise<Category | null> {
    try {
      const category = await this.findOne(id);
      if (!category) return null;

      return await this.categoryRepo.remove(category);
    } catch (err) {
      console.error('Error deleting category:', err);
      return null;
    }
  }

  async toggleActive(id: string): Promise<Category | null> {
    try {
      const category = await this.findOne(id);
      if (!category) return null;

      category.isActive = !category.isActive;
      return await this.categoryRepo.save(category);
    } catch (err) {
      console.error('Error toggling category status:', err);
      return null;
    }
  }
}
