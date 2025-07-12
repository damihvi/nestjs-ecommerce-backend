// MongoDB Schemas - Centralized exports
// Esta carpeta contiene todos los schemas que se suben a MongoDB Atlas
// Esquemas complementarios que NO duplican datos de PostgreSQL

// Analytics & Logging (MongoDB específico)
export { Analytics, AnalyticsSchema, AnalyticsDocument } from './analytics.schema';
export { Log, LogSchema, LogDocument } from './log.schema';

// User Sessions (MongoDB específico)
export { UserSession, UserSessionSchema, UserSessionDocument } from './user-session.schema';

// Notifications (MongoDB para flexibilidad)
export { NotificationMongo, NotificationMongoSchema, NotificationDocument } from './notification.schema';

// Tipos y interfaces comunes para MongoDB
export interface MongoBaseDocument {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Configuración de conexión MongoDB
export const MONGODB_COLLECTIONS = {
  ANALYTICS: 'analytics',
  LOGS: 'logs',
  USERS: 'users',
  USER_SESSIONS: 'user_sessions',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications'
} as const;

// Tipos de eventos para analytics
export const ANALYTICS_EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'product_view',
  PURCHASE: 'purchase',
  CLICK: 'click',
  SEARCH: 'search',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  USER_REGISTER: 'user_register',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout'
} as const;

// Tipos de logs
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const;

// Estados de notificaciones
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  PROMOTION: 'promotion'
} as const;

// Prioridades de notificaciones
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;
