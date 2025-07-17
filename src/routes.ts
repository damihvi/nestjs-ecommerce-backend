// Rutas públicas
export const PUBLIC_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  CATEGORIES: {
    LIST: '/categories',
    PUBLIC_LIST: '/categories/public',
    BY_SLUG: (slug: string) => `/categories/${slug}`,
    ACTIVE: '/categories/active',
  },
  PRODUCTS: {
    LIST: '/products',
    PUBLIC_LIST: '/products/public',
    FEATURED: '/products/featured',
    BY_CATEGORY: (categoryId: string) => `/products/category/${categoryId}`,
    BY_SLUG: (slug: string) => `/products/${slug}`,
  },
  CART: {
    GET: (userId: string) => `/cart/user/${userId}`,
    ADD: '/cart/add',
    UPDATE: (itemId: string) => `/cart/item/${itemId}`,
    REMOVE: '/cart/remove',
    CLEAR: (userId: string) => `/cart/user/${userId}/clear`,
  },
};

// Rutas administrativas (requieren autenticación y rol de admin)
export const ADMIN_ROUTES = {
  CATEGORIES: {
    BASE: '/admin/categories',
    CREATE: '/admin/categories',
    UPDATE: (id: string) => `/admin/categories/${id}`,
    DELETE: (id: string) => `/admin/categories/${id}`,
    TOGGLE: (id: string) => `/admin/categories/${id}/toggle-active`,
    UPLOAD_IMAGE: (id: string) => `/admin/categories/${id}/image`,
  },
  PRODUCTS: {
    BASE: '/admin/products',
    CREATE: '/admin/products',
    UPDATE: (id: string) => `/admin/products/${id}`,
    DELETE: (id: string) => `/admin/products/${id}`,
    TOGGLE: (id: string) => `/admin/products/${id}/toggle-active`,
    TOGGLE_FEATURED: (id: string) => `/admin/products/${id}/toggle-featured`,
    UPLOAD_IMAGES: (id: string) => `/admin/products/${id}/images`,
  },
  ORDERS: {
    BASE: '/admin/orders',
    LIST: '/admin/orders',
    UPDATE: (id: string) => `/admin/orders/${id}`,
    CANCEL: (id: string) => `/admin/orders/${id}/cancel`,
    STATS: '/admin/orders/stats',
  },
  USERS: {
    BASE: '/admin/users',
    LIST: '/admin/users',
    CREATE: '/admin/users',
    UPDATE: (id: string) => `/admin/users/${id}`,
    DELETE: (id: string) => `/admin/users/${id}`,
    TOGGLE: (id: string) => `/admin/users/${id}/toggle-active`,
  },
  DASHBOARD: {
    STATS: '/admin/dashboard/stats',
    SALES: '/admin/dashboard/sales',
    INVENTORY: '/admin/dashboard/inventory',
  },
};

// Configuración de API
export const API_CONFIG = {
  BASE_URL: 'https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
};

// Headers comunes
export const API_HEADERS = {
  PUBLIC: {
    'Content-Type': 'application/json',
  },
  PRIVATE: {
    'Content-Type': 'application/json',
    // El token se agregará dinámicamente
  },
  MULTIPART: {
    // Para subida de archivos
    // Content-Type se establecerá automáticamente con FormData
  },
};

// Estados de órdenes
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  SELLER: 'seller',
};
