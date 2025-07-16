import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadImageDto, ImageDetailDto } from './dto/upload-image.dto';
import { Category } from '../categories/category.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    // MongoDB removed - using PostgreSQL only for products
  ) {}

  // Método público para devolver todos los productos activos
  async findAllPublicActive(): Promise<Product[]> {
    try {
      return await this.productsRepository.find({
        where: { isActive: true },
        relations: ['category'],
        order: { createdAt: 'DESC' }
      });
    } catch (err) {
      console.error('Error fetching public active products:', err);
      return [];
    }
  }

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
        images: createProductDto.images || [],
        sku: createProductDto.sku,
        brand: createProductDto.brand,
        weight: createProductDto.weight,
        dimensions: createProductDto.dimensions,
        isActive: createProductDto.isActive ?? true,
        category: category,
      });

      const savedProduct = await this.productsRepository.save(product);
      
      // MongoDB sync removed - using PostgreSQL only
      
      return savedProduct;
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
        queryBuilder.andWhere('category.id = :categoryId', { categoryId });
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
      const updatedProduct = await this.productsRepository.save(product);
      
      // MongoDB sync removed - using PostgreSQL only
      
      return updatedProduct;
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

  async addImage(id: string, file: Express.Multer.File, imageData?: UploadImageDto): Promise<Product | null> {
    try {
      const product = await this.findOne(id);
      if (!product) return null;

      // Prepare image details
      const imageDetail: ImageDetailDto = {
        url: `/products/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
        altText: imageData?.altText || '',
        isPrimary: imageData?.isPrimary || false,
        order: imageData?.order || 0
      };

      // Initialize arrays if they don't exist
      if (!product.images) product.images = [];
      if (!product.imageDetails) product.imageDetails = '[]';

      // Parse existing image details
      let imageDetails: ImageDetailDto[] = [];
      try {
        imageDetails = JSON.parse(product.imageDetails);
      } catch (e) {
        imageDetails = [];
      }

      // If this is set as primary, update others
      if (imageDetail.isPrimary) {
        imageDetails.forEach(detail => detail.isPrimary = false);
        product.image = file.filename; // Update legacy image field
      }

      // Add new image
      product.images.push(file.filename);
      imageDetails.push(imageDetail);
      product.imageDetails = JSON.stringify(imageDetails);

      return await this.productsRepository.save(product);
    } catch (err) {
      console.error('Error adding image to product:', err);
      return null;
    }
  }

  async addMultipleImages(id: string, files: Express.Multer.File[]): Promise<Product | null> {
    try {
      const product = await this.findOne(id);
      if (!product) return null;

      // Initialize arrays if they don't exist
      if (!product.images) product.images = [];
      if (!product.imageDetails) product.imageDetails = '[]';

      // Parse existing image details
      let imageDetails: ImageDetailDto[] = [];
      try {
        imageDetails = JSON.parse(product.imageDetails);
      } catch (e) {
        imageDetails = [];
      }

      // Process each file
      files.forEach((file, index) => {
        const imageDetail: ImageDetailDto = {
          url: `/products/${file.filename}`,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          altText: '',
          isPrimary: index === 0 && imageDetails.length === 0, // First image as primary if no existing images
          order: imageDetails.length + index
        };

        product.images.push(file.filename);
        imageDetails.push(imageDetail);

        // Set first image as legacy image if no primary exists
        if (imageDetail.isPrimary) {
          product.image = file.filename;
        }
      });

      product.imageDetails = JSON.stringify(imageDetails);
      return await this.productsRepository.save(product);
    } catch (err) {
      console.error('Error adding multiple images to product:', err);
      return null;
    }
  }

  async removeImage(id: string, imageIndex: number): Promise<Product | null> {
    try {
      const product = await this.findOne(id);
      if (!product) return null;

      if (!product.images || !product.imageDetails) return product;

      // Parse image details
      let imageDetails: ImageDetailDto[] = [];
      try {
        imageDetails = JSON.parse(product.imageDetails);
      } catch (e) {
        return product;
      }

      if (imageIndex >= imageDetails.length || imageIndex < 0) return null;

      // Get filename to delete
      const imageToDelete = imageDetails[imageIndex];
      const filePath = path.join('./public/products', imageToDelete.filename);

      // Delete file from filesystem
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.warn('Could not delete file:', filePath);
      }

      // Remove from arrays
      product.images.splice(imageIndex, 1);
      imageDetails.splice(imageIndex, 1);

      // If removed image was primary, set new primary
      if (imageToDelete.isPrimary && imageDetails.length > 0) {
        imageDetails[0].isPrimary = true;
        product.image = imageDetails[0].filename;
      } else if (imageDetails.length === 0) {
        product.image = undefined;
      }

      product.imageDetails = JSON.stringify(imageDetails);
      return await this.productsRepository.save(product);
    } catch (err) {
      console.error('Error removing image from product:', err);
      return null;
    }
  }

  async setPrimaryImage(id: string, imageIndex: number): Promise<Product | null> {
    try {
      const product = await this.findOne(id);
      if (!product) return null;

      if (!product.imageDetails) return product;

      // Parse image details
      let imageDetails: ImageDetailDto[] = [];
      try {
        imageDetails = JSON.parse(product.imageDetails);
      } catch (e) {
        return product;
      }

      if (imageIndex >= imageDetails.length || imageIndex < 0) return null;

      // Update primary status
      imageDetails.forEach((detail, index) => {
        detail.isPrimary = index === imageIndex;
      });

      // Update legacy image field
      product.image = imageDetails[imageIndex].filename;
      product.imageDetails = JSON.stringify(imageDetails);

      return await this.productsRepository.save(product);
    } catch (err) {
      console.error('Error setting primary image:', err);
      return null;
    }
  }

  // Note: MongoDB methods removed - using PostgreSQL only for products
}
