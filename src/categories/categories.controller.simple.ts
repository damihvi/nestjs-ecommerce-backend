import {
  Controller, Get, Post, Put, Delete,
  Param, Body, NotFoundException
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    try {
      const categories = await this.categoriesService.findAll();
      return {
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      };
    } catch (error) {
      throw new NotFoundException('Failed to retrieve categories');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      success: true,
      message: 'Category retrieved successfully',
      data: category
    };
  }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.categoriesService.create(createCategoryDto);
      return {
        success: true,
        message: 'Category created successfully',
        data: category
      };
    } catch (error) {
      throw new NotFoundException('Failed to create category');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      success: true,
      message: 'Category updated successfully',
      data: category
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const success = await this.categoriesService.delete(id);
    if (!success) {
      throw new NotFoundException('Category not found');
    }
    return {
      success: true,
      message: 'Category deleted successfully'
    };
  }
}
