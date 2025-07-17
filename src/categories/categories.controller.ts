import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, NotFoundException, InternalServerErrorException,
  UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Category } from './category.entity';
// ...existing code...
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { SuccessResponseDto } from 'src/common/dto/response.dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Rutas públicas
  @Get('categories/public')
  async getPublicCategories() {
    const categories = await this.categoriesService.findActive();
    return new SuccessResponseDto('Categories retrieved successfully', categories);
  }

  @Get('categories/:slug')
  async getPublicCategory(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    if (!category) throw new NotFoundException('Category not found');
    return new SuccessResponseDto('Category retrieved successfully', category);
  }

  // Rutas administrativas
  @UseGuards(AdminGuard)
  @Post('admin/categories')
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.create(dto);
    if (!category) throw new InternalServerErrorException('Failed to create category');
    return new SuccessResponseDto('Category created successfully', category);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: string,
  ): Promise<SuccessResponseDto<Pagination<Category>>> {
    const isActiveBoolean = isActive === 'false' ? false : isActive === 'true' ? true : undefined;
    const result = await this.categoriesService.findAll({ page, limit }, isActiveBoolean);

    if (!result) throw new InternalServerErrorException('Could not retrieve categories');

    return new SuccessResponseDto('Categories retrieved successfully', result);
  }

  @Get('active')
  async findActive(): Promise<SuccessResponseDto<Category[]>> {
    const categories = await this.categoriesService.findActive();
    return new SuccessResponseDto('Active categories retrieved successfully', categories);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    if (!category) throw new NotFoundException('Category not found');
    return new SuccessResponseDto('Category retrieved successfully', category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    if (!category) throw new NotFoundException('Category not found');
    return new SuccessResponseDto('Category retrieved successfully', category);
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.categoriesService.update(id, dto);
    if (!category) throw new NotFoundException('Category not found');
    return new SuccessResponseDto('Category updated successfully', category);
  }
  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const category = await this.categoriesService.toggleActive(id);
    if (!category) throw new NotFoundException('Category not found');
    return new SuccessResponseDto('Category status toggled successfully', category);
  }
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/categories',
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Only JPG, JPEG, PNG, or WEBP files are allowed'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  }))
  async uploadImage(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('Category image is required');
    
    const category = await this.categoriesService.update(id, { image: file.filename });
    if (!category) throw new NotFoundException('Category not found');
    return new SuccessResponseDto('Category image updated successfully', category);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const category = await this.categoriesService.remove(id);
    if (!category) throw new NotFoundException('Category not found');
    return new SuccessResponseDto('Category deleted successfully', category);
  }
}
