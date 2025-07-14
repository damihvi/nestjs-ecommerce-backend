// Tipos centralizados para roles del sistema
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SELLER = 'seller'
}

// Mapeo de roles para display en el frontend
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.SELLER]: 'Vendedor',
  [UserRole.CUSTOMER]: 'Cliente'
};

// Colores para roles en el frontend
export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '#dc3545',     // Rojo
  [UserRole.SELLER]: '#28a745',    // Verde
  [UserRole.CUSTOMER]: '#6c757d'   // Gris
};

// Permisos básicos por rol para el frontend
export const ROLE_CAPABILITIES: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'manage_users',
    'manage_products',
    'manage_categories',
    'manage_orders',
    'view_analytics',
    'manage_coupons',
    'system_config'
  ],
  [UserRole.SELLER]: [
    'manage_products',
    'manage_categories',
    'view_orders',
    'view_analytics',
    'manage_coupons'
  ],
  [UserRole.CUSTOMER]: [
    'view_products',
    'place_orders',
    'manage_profile'
  ]
};

// Rutas permitidas por rol
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    '/admin',
    '/admin/users',
    '/admin/products',
    '/admin/categories',
    '/admin/orders',
    '/admin/analytics',
    '/admin/coupons',
    '/admin/settings'
  ],
  [UserRole.SELLER]: [
    '/seller',
    '/seller/products',
    '/seller/categories',
    '/seller/orders',
    '/seller/analytics',
    '/seller/coupons'
  ],
  [UserRole.CUSTOMER]: [
    '/profile',
    '/orders',
    '/wishlist',
    '/cart'
  ]
};

// Función helper para verificar si un usuario tiene una capacidad específica
export function hasCapability(userRole: UserRole, capability: string): boolean {
  return ROLE_CAPABILITIES[userRole]?.includes(capability) || false;
}

// Función helper para verificar si un usuario puede acceder a una ruta
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  return ROLE_ROUTES[userRole]?.some(allowedRoute => 
    route.startsWith(allowedRoute)
  ) || false;
}

// Función helper para obtener el nombre de display de un rol
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] || 'Desconocido';
}

// Función helper para obtener el color de un rol
export function getRoleColor(role: UserRole): string {
  return ROLE_COLORS[role] || '#6c757d';
}

// Función helper para validar si un rol es válido
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

// Función helper para verificar si es admin
export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

// Función helper para verificar si es seller
export function isSeller(userRole: UserRole): boolean {
  return userRole === UserRole.SELLER;
}

// Función helper para verificar si es customer
export function isCustomer(userRole: UserRole): boolean {
  return userRole === UserRole.CUSTOMER;
}
