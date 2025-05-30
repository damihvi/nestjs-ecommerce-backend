# NestJS E-commerce Backend

A comprehensive e-commerce backend built with NestJS, TypeScript, and PostgreSQL.

## 🚀 Features

### Core Modules
- **Authentication & Authorization** - Dual authentication system:
  - JWT-based authentication (stateless)
  - Session-based authentication (stateful with cookies)
  - Role-based access control (Admin/Customer)
- **User Management** - User registration, profiles, and admin management
- **Product Catalog** - Products with categories, pricing, and inventory
- **Shopping Cart** - Session-based cart management
- **Order Management** - Complete order lifecycle with status tracking
- **Reviews & Ratings** - Product review system with helpfulness voting
- **Wishlist** - Save products for later
- **Coupon System** - Discount codes with validation and usage tracking
- **Inventory Management** - Stock tracking, movements, and alerts
- **Admin Panel** - Administrative functions for managing the platform

### Advanced Features
- **Pagination** - Efficient data pagination across all endpoints
- **File Uploads** - Image upload support for products and categories
- **Stock Alerts** - Automated low stock and overstock notifications
- **Inventory Movements** - Complete audit trail of stock changes
- **Coupon Validation** - Complex discount rules and usage limitations
- **Search & Filtering** - Product search with category and price filters
- **Order Statistics** - Analytics for users and administrators

## 🛠 Technology Stack

- **Backend Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens) + Session-based
- **Validation**: class-validator
- **File Upload**: Multer
- **Environment**: dotenv

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env.example to .env and update with your values
cp .env.example .env
```

4. Update the `.env` file with your database configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=ecommerce_db

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-key
```

5. Start the application:
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 🚁 Deploy to Railway

This project is ready to deploy on Railway with zero configuration:

### Quick Deploy
1. Fork this repository
2. Connect to Railway: https://railway.app
3. Create new project from GitHub repo
4. Add a PostgreSQL database service
5. Set environment variables:
   ```env
   JWT_SECRET=your-jwt-secret-key
   SESSION_SECRET=your-session-secret-key
   ```
6. Deploy automatically!

### Railway Configuration Files
- `Procfile` - Defines the start command
- `railway.json` - Railway-specific configuration
- `.env.example` - Environment variables template

Railway will automatically:
- Install dependencies
- Build the TypeScript project
- Start the production server
- Provide PostgreSQL database with SSL
- Set up automatic deployments

### Environment Variables for Railway
Railway automatically provides:
- `DATABASE_URL` or individual DB variables
- `PORT` (automatically configured)
- Custom variables you set in the Railway dashboard

## 🚀 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile/:userId` - Get user profile
- `PUT /auth/profile/:userId` - Update user profile
- `POST /auth/change-password/:userId` - Change password

### Products
- `GET /products` - Get all products (with pagination and filters)
- `GET /products/featured` - Get featured products
- `GET /products/category/:categoryId` - Get products by category
- `GET /products/:id` - Get single product
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Categories
- `GET /categories` - Get all categories
- `GET /categories/active` - Get active categories
- `GET /categories/slug/:slug` - Get category by slug
- `POST /categories` - Create category (Admin)
- `PUT /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

### Shopping Cart
- `POST /cart/add` - Add item to cart
- `GET /cart/user/:userId` - Get user's cart
- `GET /cart/user/:userId/summary` - Get cart summary
- `PUT /cart/item/:cartItemId` - Update cart item
- `DELETE /cart/remove` - Remove item from cart
- `DELETE /cart/user/:userId/clear` - Clear entire cart

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get all orders (Admin)
- `GET /orders/:id` - Get single order
- `GET /orders/user/:userId/stats` - Get user order statistics
- `PUT /orders/:id` - Update order status (Admin)
- `PUT /orders/:id/cancel` - Cancel order

### Reviews
- `POST /reviews` - Create review
- `GET /reviews` - Get all reviews
- `GET /reviews/product/:productId/stats` - Get product rating stats
- `GET /reviews/user/:userId` - Get user reviews
- `PUT /reviews/:id/helpful` - Mark review as helpful
- `DELETE /reviews/:id` - Delete review

### Wishlist
- `POST /wishlists/add` - Add item to wishlist
- `GET /wishlists/user/:userId` - Get user's wishlist
- `GET /wishlists/user/:userId/summary` - Get wishlist summary
- `DELETE /wishlists/remove` - Remove item from wishlist
- `POST /wishlists/user/:userId/move-to-cart/:productId` - Move to cart

### Coupons
- `POST /coupons` - Create coupon (Admin)
- `GET /coupons` - Get all coupons (Admin)
- `GET /coupons/active` - Get active coupons
- `POST /coupons/validate` - Validate coupon
- `GET /coupons/stats` - Get coupon statistics (Admin)
- `PUT /coupons/:id/toggle-status` - Toggle coupon status (Admin)

### Inventory
- `POST /inventory/movements` - Record inventory movement (Admin)
- `POST /inventory/adjust` - Adjust stock levels (Admin)
- `GET /inventory/movements` - Get inventory movements (Admin)
- `GET /inventory/alerts` - Get stock alerts (Admin)
- `GET /inventory/low-stock` - Get low stock products (Admin)
- `GET /inventory/report` - Get inventory report (Admin)

## 🏗 Database Schema

The application uses the following main entities:

- **User** - User accounts and profiles
- **Product** - Product catalog with pricing and inventory
- **Category** - Product categories
- **CartItem** - Shopping cart items
- **Order** & **OrderItem** - Orders and order details
- **Review** & **ReviewHelpfulness** - Product reviews
- **WishlistItem** - Wishlist items
- **Coupon** & **CouponUsage** - Discount system
- **InventoryMovement** & **StockAlert** - Inventory tracking

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with role-based access control:

- **Public endpoints** - Categories, products (read-only)
- **Authenticated endpoints** - Cart, orders, reviews, wishlist
- **Admin endpoints** - User management, product management, inventory, coupons

## 🚦 Getting Started

1. Start the application using `npm run start:dev`
2. The API will be available at `http://localhost:3000`
3. Use the seed endpoint to populate initial data: `POST /seed`
4. Register a new user or use admin credentials to access protected endpoints

## 📝 Development

- **Build**: `npm run build`
- **Test**: `npm run test`
- **Lint**: `npm run lint`
- **Format**: `npm run format`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

*Proyecto ecommerce - Programación 3*
