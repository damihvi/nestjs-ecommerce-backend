import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Category | null> {
    return this.categoryRepo.findOne({ where: { id } });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category | null> {
    const slug = createCategoryDto.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const category = this.categoryRepo.create({
      ...createCategoryDto,
      slug,
      isActive: true
    });

    return this.categoryRepo.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
    const category = await this.findOne(id);
    if (!category) return null;

    if (updateCategoryDto.name) {
      const slug = updateCategoryDto.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      Object.assign(updateCategoryDto, { slug });
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepo.save(category);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categoryRepo.delete(id);
    return result.affected > 0;
  }
}
