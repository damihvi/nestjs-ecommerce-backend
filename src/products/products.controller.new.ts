import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Rutas públicas
  @Get('public')
  async getPublicProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
  ) {
    const products = await this.productsService.findActive({ page, limit }, category);
    return new SuccessResponseDto('Products retrieved successfully', products);
  }

  @Get('public/:slug')
  async getPublicProduct(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product retrieved successfully', product);
  }

  // Rutas administrativas
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post()
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.create(dto);
    if (!product) throw new InternalServerErrorException('Failed to create product');
    return new SuccessResponseDto('Product created successfully', product);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBoolean = isActive === 'false' ? false : isActive === 'true' ? true : undefined;
    const products = await this.productsService.findAll({ page, limit }, isActiveBoolean);
    return new SuccessResponseDto('Products retrieved successfully', products);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.update(id, dto);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product updated successfully', product);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Put(':id/toggle')
  async toggleActive(@Param('id') id: string) {
    const product = await this.productsService.toggleActive(id);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product status toggled successfully', product);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 5, {
    storage: diskStorage({
      destination: './public/products',
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Only JPG, JPEG, PNG, or WEBP files are allowed'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit per file
    }
  }))
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Product images are required');
    }
    
    const imageUrls = files.map(file => file.filename);
    const product = await this.productsService.addImages(id, imageUrls);
    
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product images uploaded successfully', product);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const product = await this.productsService.remove(id);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product deleted successfully', product);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Put(':id/inventory')
  async updateInventory(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Body('type') type: 'add' | 'subtract' = 'add'
  ) {
    const product = await this.productsService.updateInventory(id, quantity, type);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product inventory updated successfully', product);
  }
}
