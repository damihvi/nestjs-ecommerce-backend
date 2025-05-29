import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async seedDatabase() {
    // Check if data already exists
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      return { message: 'Database already seeded' };
    }

    try {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@ecommerce.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
        phone: '+1234567890',
        address: '123 Admin Street',
        city: 'Admin City',
        postalCode: '12345',
        country: 'USA'
      });
      await this.userRepository.save(admin);

      // Create sample customer
      const customerPassword = await bcrypt.hash('customer123', 10);      const customer = this.userRepository.create({
        username: 'customer1',
        email: 'customer@example.com',
        password: customerPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
        isActive: true,
        phone: '+1987654321',
        address: '456 Customer Avenue',
        city: 'Customer City',
        postalCode: '54321',
        country: 'USA'
      });
      await this.userRepository.save(customer);

      // Create categories
      const categories = [
        {
          name: 'Electronics',
          description: 'Electronic devices and gadgets',
          slug: 'electronics',
          isActive: true
        },
        {
          name: 'Clothing',
          description: 'Fashion and apparel',
          slug: 'clothing',
          isActive: true
        },
        {
          name: 'Books',
          description: 'Books and literature',
          slug: 'books',
          isActive: true
        },
        {
          name: 'Home & Garden',
          description: 'Home improvement and gardening',
          slug: 'home-garden',
          isActive: true
        },
        {
          name: 'Sports & Fitness',
          description: 'Sports equipment and fitness gear',
          slug: 'sports-fitness',
          isActive: true
        }      ];

      const savedCategories: Category[] = [];
      for (const categoryData of categories) {
        const category = this.categoryRepository.create(categoryData);
        const saved = await this.categoryRepository.save(category);
        savedCategories.push(saved);
      }

      // Create sample products
      const products = [
        // Electronics
        {
          name: 'Smartphone X1',
          description: 'Latest smartphone with advanced features',
          price: 699.99,
          stock: 50,
          brand: 'TechBrand',
          sku: 'PHONE-X1-001',
          weight: 0.2,
          dimensions: '15x7x0.8 cm',
          isActive: true,
          category: savedCategories[0] // Electronics
        },
        {
          name: 'Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones',
          price: 199.99,
          stock: 30,
          brand: 'AudioTech',
          sku: 'HEAD-WL-002',
          weight: 0.3,
          dimensions: '20x18x8 cm',
          isActive: true,
          category: savedCategories[0] // Electronics
        },
        {
          name: 'Laptop Pro 15"',
          description: 'High-performance laptop for professionals',
          price: 1299.99,
          stock: 20,
          brand: 'CompuTech',
          sku: 'LAP-PRO-003',
          weight: 2.1,
          dimensions: '35x24x2 cm',
          isActive: true,
          category: savedCategories[0] // Electronics
        },

        // Clothing
        {
          name: 'Classic T-Shirt',
          description: 'Comfortable cotton t-shirt in various colors',
          price: 19.99,
          stock: 100,
          brand: 'FashionCo',
          sku: 'TSHIRT-CL-004',
          weight: 0.2,
          dimensions: 'Various sizes',
          isActive: true,
          category: savedCategories[1] // Clothing
        },
        {
          name: 'Denim Jeans',
          description: 'Premium quality denim jeans',
          price: 79.99,
          stock: 60,
          brand: 'DenimWorks',
          sku: 'JEANS-DN-005',
          weight: 0.6,
          dimensions: 'Various sizes',
          isActive: true,
          category: savedCategories[1] // Clothing
        },

        // Books
        {
          name: 'JavaScript Complete Guide',
          description: 'Comprehensive guide to JavaScript programming',
          price: 39.99,
          stock: 40,
          brand: 'TechBooks',
          sku: 'BOOK-JS-006',
          weight: 0.8,
          dimensions: '23x18x3 cm',
          isActive: true,
          category: savedCategories[2] // Books
        },
        {
          name: 'Web Development Handbook',
          description: 'Essential handbook for web developers',
          price: 34.99,
          stock: 35,
          brand: 'DevPress',
          sku: 'BOOK-WD-007',
          weight: 0.7,
          dimensions: '23x18x2.5 cm',
          isActive: true,
          category: savedCategories[2] // Books
        },

        // Home & Garden
        {
          name: 'Coffee Maker Deluxe',
          description: 'Programmable coffee maker with thermal carafe',
          price: 89.99,
          stock: 25,
          brand: 'BrewMaster',
          sku: 'COFFEE-DX-008',
          weight: 3.2,
          dimensions: '30x20x35 cm',
          isActive: true,
          category: savedCategories[3] // Home & Garden
        },
        {
          name: 'Garden Tool Set',
          description: 'Complete set of essential gardening tools',
          price: 49.99,
          stock: 15,
          brand: 'GreenThumb',
          sku: 'GARDEN-TS-009',
          weight: 2.5,
          dimensions: '50x30x10 cm',
          isActive: true,
          category: savedCategories[3] // Home & Garden
        },

        // Sports & Fitness
        {
          name: 'Yoga Mat Premium',
          description: 'Non-slip premium yoga mat',
          price: 29.99,
          stock: 80,
          brand: 'FitLife',
          sku: 'YOGA-PM-010',
          weight: 1.2,
          dimensions: '180x60x0.6 cm',
          isActive: true,
          category: savedCategories[4] // Sports & Fitness
        },
        {
          name: 'Resistance Bands Set',
          description: 'Complete set of resistance bands for home workouts',
          price: 24.99,
          stock: 45,
          brand: 'HomeFit',
          sku: 'RESIST-BS-011',
          weight: 0.8,
          dimensions: '25x15x5 cm',
          isActive: true,
          category: savedCategories[4] // Sports & Fitness
        }
      ];

      for (const productData of products) {
        const product = this.productRepository.create(productData);
        await this.productRepository.save(product);
      }

      return {
        message: 'Database seeded successfully',
        data: {
          users: 2,
          categories: savedCategories.length,
          products: products.length
        }
      };

    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      await this.productRepository.delete({});
      await this.categoryRepository.delete({});
      await this.userRepository.delete({});
      
      return { message: 'Database cleared successfully' };
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
}
