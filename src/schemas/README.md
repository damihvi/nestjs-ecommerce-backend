# MongoDB Schemas - Ecommerce Backend

Esta carpeta contiene todos los schemas de MongoDB para el backend de ecommerce. Estos schemas definen la estructura de los documentos que se almacenan en MongoDB Atlas.

## 📊 Colecciones MongoDB

### 1. **Analytics** (`analytics.schema.ts`)
**Colección**: `analytics`
**Propósito**: Tracking de eventos y analytics en tiempo real

**Campos principales**:
- `eventType`: Tipo de evento (page_view, product_view, purchase, etc.)
- `eventName`: Nombre específico del evento
- `eventData`: Datos adicionales del evento
- `userId`: ID del usuario (opcional)
- `sessionId`: ID de sesión
- `productId`: ID del producto (para eventos relacionados)
- `page`: Página donde ocurrió el evento
- `userAgent`, `ip`, `country`, `city`: Datos del navegador y ubicación
- `revenue`, `quantity`: Datos de ventas
- `timestamp`: Marca de tiempo

### 2. **Logs** (`log.schema.ts`)
**Colección**: `logs`
**Propósito**: Sistema de logging centralizado

**Campos principales**:
- `level`: Nivel de log (error, warn, info, debug)
- `message`: Mensaje del log
- `metadata`: Datos adicionales
- `userId`: Usuario asociado
- `action`: Acción realizada
- `ip`, `userAgent`: Datos de contexto
- `timestamp`: Marca de tiempo

### 3. **User Sessions** (`user-session.schema.ts`)
**Colección**: `user_sessions`
**Propósito**: Tracking de sesiones de usuario

**Campos principales**:
- `sessionId`: ID único de sesión
- `userId`: ID del usuario
- `email`: Email del usuario
- `userAgent`, `ip`: Datos del navegador
- `country`, `city`: Ubicación geográfica
- `device`, `browser`, `os`: Información del dispositivo
- `startTime`, `endTime`: Tiempo de inicio y fin de sesión
- `duration`: Duración en segundos
- `pageViews`, `actions`: Contadores de actividad
- `isActive`: Si la sesión está activa
- `visitedPages`: Array de páginas visitadas
- `metadata`: Datos adicionales

### 4. **Users** (`user.schema.ts`)
**Colección**: `users`
**Propósito**: Datos de usuarios (réplica de PostgreSQL + analytics)

**Campos principales**:
- `email`: Email único del usuario
- `firstName`, `lastName`: Nombres
- `phone`: Teléfono
- `status`: Estado del usuario
- `createdAt`, `updatedAt`: Fechas de creación y actualización
- `lastLogin`: Último login
- `loginCount`: Contador de logins
- `loginHistory`: Historial de accesos
- `preferences`: Preferencias del usuario
- `analytics`: Datos analíticos adicionales

### 5. **Products** (`product.schema.ts`)
**Colección**: `products`
**Propósito**: Productos con datos analíticos avanzados

**Campos principales**:
- `name`, `description`: Información básica
- `price`: Precio
- `sku`: Código de producto
- `categoryId`: ID de categoría
- `stock`: Inventario
- `status`: Estado del producto
- `images`: Array de imágenes
- `specifications`: Especificaciones técnicas
- `viewCount`: Contador de visualizaciones
- `purchaseCount`: Contador de compras
- `wishlistCount`: Contador de wishlists
- `viewHistory`: Historial de visualizaciones
- `analytics`: Datos analíticos adicionales

### 6. **Orders** (`order.schema.ts`)
**Colección**: `orders`
**Propósito**: Órdenes con analytics de procesamiento

**Campos principales**:
- `userId`: ID del usuario
- `orderNumber`: Número de orden único
- `total`: Total de la orden
- `status`: Estado de la orden
- `paymentMethod`: Método de pago
- `items`: Array de productos comprados
- `shippingAddress`, `billingAddress`: Direcciones
- `processingTime`: Tiempo de procesamiento en minutos
- `shippingTime`: Tiempo de envío en días
- `customerAnalytics`: Analytics del cliente
- `statusHistory`: Historial de cambios de estado

### 7. **Reviews** (`review.schema.ts`)
**Colección**: `reviews`
**Propósito**: Sistema avanzado de reseñas

**Campos principales**:
- `productId`: ID del producto
- `userId`: ID del usuario
- `userName`: Nombre del usuario
- `rating`: Calificación (1-5)
- `title`: Título de la reseña
- `comment`: Comentario
- `images`: Imágenes de la reseña
- `verified`: Si es una compra verificada
- `helpfulCount`: Contador de "útil"
- `helpfulUsers`: Array de usuarios que marcaron como útil
- `status`: Estado de moderación
- `moderationNotes`: Notas de moderación
- `response`: Respuesta del vendedor/admin

### 8. **Notifications** (`notification.schema.ts`)
**Colección**: `notifications`
**Propósito**: Sistema de notificaciones push

**Campos principales**:
- `userId`: ID del usuario
- `title`: Título de la notificación
- `message`: Mensaje
- `type`: Tipo (info, success, warning, error, promotion)
- `read`: Si fue leída
- `priority`: Prioridad (low, medium, high, urgent)
- `data`: Datos adicionales
- `actionUrl`: URL de acción
- `imageUrl`: Imagen de la notificación
- `expiresAt`: Fecha de expiración
- `readAt`: Fecha de lectura

## 🔧 Uso de los Schemas

### Importación
```typescript
import { 
  Analytics, 
  AnalyticsSchema, 
  ANALYTICS_EVENT_TYPES 
} from '@/schemas';
```

### Configuración en Módulos
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema },
      { name: Log.name, schema: LogSchema }
    ])
  ]
})
```

### Inyección en Servicios
```typescript
constructor(
  @InjectModel(Analytics.name) 
  private analyticsModel: Model<AnalyticsDocument>
) {}
```

## 📈 Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**: PostgreSQL para datos transaccionales, MongoDB para analytics
2. **Escalabilidad**: MongoDB maneja grandes volúmenes de datos analíticos
3. **Flexibilidad**: Schemas flexibles para datos no estructurados
4. **Performance**: Consultas optimizadas para cada tipo de dato
5. **Sync Híbrido**: Sincronización automática entre ambas bases de datos

## 🛠️ Comandos Útiles

### Crear nuevo evento analítico
```typescript
await this.analyticsModel.create({
  eventType: ANALYTICS_EVENT_TYPES.PRODUCT_VIEW,
  eventName: 'Product Detail View',
  productId: 'prod_123',
  userId: 'user_456',
  sessionId: 'session_789'
});
```

### Crear log de sistema
```typescript
await this.logModel.create({
  level: LOG_LEVELS.INFO,
  message: 'User logged in successfully',
  userId: 'user_123',
  action: 'login',
  metadata: { loginMethod: 'email' }
});
```

### Crear notificación
```typescript
await this.notificationModel.create({
  userId: 'user_123',
  title: 'Pedido Confirmado',
  message: 'Tu pedido #ORD-001 ha sido confirmado',
  type: NOTIFICATION_TYPES.SUCCESS,
  priority: NOTIFICATION_PRIORITIES.HIGH
});
```

## 🔄 Sincronización con PostgreSQL

Los schemas de `users`, `products` y `orders` están sincronizados con PostgreSQL a través del servicio híbrido que:

1. Escucha cambios en PostgreSQL
2. Replica datos esenciales en MongoDB
3. Añade campos analíticos específicos de MongoDB
4. Mantiene consistencia entre ambas bases

Esta arquitectura permite aprovechar lo mejor de ambos mundos: la consistencia ACID de PostgreSQL y la flexibilidad analítica de MongoDB.
