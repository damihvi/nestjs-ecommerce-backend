import {
  Controller,
  Post as HttpPost,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { Product } from './product.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { SuccessResponseDto } from 'src/common/dto/response.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Endpoint público para listar todos los productos activos
  @Get('public-list')
  async getPublicProducts() {
    const products = await this.productsService.findAllPublicActive();
    return new SuccessResponseDto('Products retrieved successfully', products);
  }
  @HttpPost()
  async create(@Body() createProductDto: CreateProductDto): Promise<SuccessResponseDto<Product>> {
    const product = await this.productsService.create(createProductDto);
    if (!product) throw new NotFoundException('Category not found or error creating product');
    return new SuccessResponseDto('Product created successfully', product);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
  ): Promise<SuccessResponseDto<Pagination<Product>>> {
    limit = limit > 100 ? 100 : limit;
    
    const isActiveBoolean = isActive === 'false' ? false : isActive === 'true' ? true : undefined;
    const minPriceNumber = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNumber = maxPrice ? parseFloat(maxPrice) : undefined;

    const result = await this.productsService.findAll(
      { page, limit },
      categoryId,
      isActiveBoolean,
      minPriceNumber,
      maxPriceNumber,
      search
    );

    if (!result) throw new InternalServerErrorException('Could not retrieve products');

    return new SuccessResponseDto('Products retrieved successfully', result);
  }

  @Get('featured')
  async findFeatured(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<SuccessResponseDto<Pagination<Product>>> {
    const result = await this.productsService.findFeatured({ page, limit });
    if (!result) throw new InternalServerErrorException('Could not retrieve featured products');
    return new SuccessResponseDto('Featured products retrieved successfully', result);
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<SuccessResponseDto<Pagination<Product>>> {
    const result = await this.productsService.findByCategory(categoryId, { page, limit });
    if (!result) throw new InternalServerErrorException('Could not retrieve products for category');
    return new SuccessResponseDto('Products by category retrieved successfully', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<Product>> {
    const product = await this.productsService.findOne(id);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product retrieved successfully', product);
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<SuccessResponseDto<Product>> {
    const product = await this.productsService.update(id, updateProductDto);
    if (!product) throw new NotFoundException('Product not found or category not found');
    return new SuccessResponseDto('Product updated successfully', product);
  }
  @Put(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body() body: { stock: number }
  ): Promise<SuccessResponseDto<Product>> {
    if (typeof body.stock !== 'number' || body.stock < 0) {
      throw new BadRequestException('Stock must be a non-negative number');
    }
    
    const product = await this.productsService.updateStock(id, body.stock);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product stock updated successfully', product);
  }
  @HttpPost(':id/image')
  @UseInterceptors(FileInterceptor('image', {
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
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  }))
  async uploadImage(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File,
    @Body() imageData: UploadImageDto
  ): Promise<SuccessResponseDto<Product>> {
    if (!file) throw new BadRequestException('Product image is required');
    
    const product = await this.productsService.addImage(id, file, imageData);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product image added successfully', product);
  }

  @HttpPost(':id/images')
  @UseInterceptors(FilesInterceptor('images', 10, {
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
  async uploadMultipleImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<SuccessResponseDto<Product>> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    
    const product = await this.productsService.addMultipleImages(id, files);
    if (!product) throw new NotFoundException('Product not found');
    return new SuccessResponseDto('Product images added successfully', product);
  }

  @Delete(':id/image/:imageIndex')
  async removeImage(
    @Param('id') id: string,
    @Param('imageIndex') imageIndex: string
  ): Promise<SuccessResponseDto<Product>> {
    const index = parseInt(imageIndex);
    if (isNaN(index) || index < 0) {
      throw new BadRequestException('Invalid image index');
    }
    
    const product = await this.productsService.removeImage(id, index);
    if (!product) throw new NotFoundException('Product or image not found');
    return new SuccessResponseDto('Product image removed successfully', product);
  }

  @Put(':id/image/:imageIndex/primary')
  async setPrimaryImage(
    @Param('id') id: string,
    @Param('imageIndex') imageIndex: string
  ): Promise<SuccessResponseDto<Product>> {
    const index = parseInt(imageIndex);
    if (isNaN(index) || index < 0) {
      throw new BadRequestException('Invalid image index');
    }
    
    const product = await this.productsService.setPrimaryImage(id, index);
    if (!product) throw new NotFoundException('Product or image not found');
    return new SuccessResponseDto('Primary image updated successfully', product);
  }
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponseDto<string>> {
    const deleted = await this.productsService.remove(id);
    if (!deleted) throw new NotFoundException('Product not found or could not be deleted');
    return new SuccessResponseDto('Product deleted successfully', id);
  }

  // Product analytics is now handled by the analytics module
  @Get(':id/analytics')
  async getProductAnalytics(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const product = await this.productsService.findOne(id);
    if (!product) throw new NotFoundException('Product not found');
    
    return new SuccessResponseDto('Product data retrieved successfully', {
      product: product,
      message: 'For detailed analytics, use the analytics module endpoints'
    });
  }
}
