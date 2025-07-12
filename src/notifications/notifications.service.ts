import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType, NotificationPriority } from './notification.entity';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async findAll(query: NotificationQueryDto): Promise<Pagination<Notification>> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .orderBy('notification.createdAt', 'DESC');

    if (query.type) {
      queryBuilder.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority: query.priority });
    }

    if (query.unreadOnly) {
      queryBuilder.andWhere('notification.status = :status', { status: NotificationStatus.UNREAD });
    }

    return paginate<Notification>(queryBuilder, {
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }

  async findByUserId(userId: string, query: NotificationQueryDto): Promise<Pagination<Notification>> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (query.type) {
      queryBuilder.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority: query.priority });
    }

    if (query.unreadOnly) {
      queryBuilder.andWhere('notification.status = :status', { status: NotificationStatus.UNREAD });
    }

    return paginate<Notification>(queryBuilder, {
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.status = NotificationStatus.READ;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ }
    );
  }

  async archive(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.status = NotificationStatus.ARCHIVED;
    return await this.notificationRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, status: NotificationStatus.UNREAD },
    });
  }

  async createWelcomeNotification(userId: string): Promise<Notification> {
    const welcomeNotification: CreateNotificationDto = {
      title: '¡Bienvenido!',
      message: 'Gracias por registrarte en nuestro ecommerce. ¡Esperamos que disfrutes de tu experiencia de compra!',
      type: NotificationType.WELCOME,
      priority: NotificationPriority.MEDIUM,
      userId,
    };

    return await this.create(welcomeNotification);
  }

  async createOrderNotification(userId: string, orderId: string, type: NotificationType): Promise<Notification> {
    const messages = {
      [NotificationType.ORDER_CREATED]: 'Tu pedido ha sido creado exitosamente',
      [NotificationType.ORDER_UPDATED]: 'Tu pedido ha sido actualizado',
      [NotificationType.ORDER_SHIPPED]: 'Tu pedido ha sido enviado',
      [NotificationType.ORDER_DELIVERED]: 'Tu pedido ha sido entregado',
    };

    const notification: CreateNotificationDto = {
      title: 'Actualización de pedido',
      message: messages[type],
      type,
      priority: NotificationPriority.HIGH,
      actionUrl: `/orders/${orderId}`,
      metadata: { orderId },
      userId,
    };

    return await this.create(notification);
  }

  async createPaymentNotification(userId: string, orderId: string, success: boolean): Promise<Notification> {
    const notification: CreateNotificationDto = {
      title: success ? 'Pago exitoso' : 'Error en el pago',
      message: success 
        ? 'Tu pago ha sido procesado exitosamente'
        : 'Hubo un problema al procesar tu pago. Por favor, inténtalo de nuevo.',
      type: success ? NotificationType.PAYMENT_SUCCESSFUL : NotificationType.PAYMENT_FAILED,
      priority: success ? NotificationPriority.HIGH : NotificationPriority.URGENT,
      actionUrl: `/orders/${orderId}`,
      metadata: { orderId },
      userId,
    };

    return await this.create(notification);
  }

  async createProductNotification(userId: string, productId: string, type: NotificationType): Promise<Notification> {
    const messages = {
      [NotificationType.PRODUCT_BACK_IN_STOCK]: 'Un producto de tu lista de deseos está disponible nuevamente',
      [NotificationType.PRICE_DROP]: 'El precio de un producto de tu lista de deseos ha bajado',
    };

    const notification: CreateNotificationDto = {
      title: 'Actualización de producto',
      message: messages[type],
      type,
      priority: NotificationPriority.MEDIUM,
      actionUrl: `/products/${productId}`,
      metadata: { productId },
      userId,
    };

    return await this.create(notification);
  }

  async cleanupExpiredNotifications(): Promise<void> {
    await this.notificationRepository.delete({
      expiresAt: { $lt: new Date() } as any,
    });
  }
}
