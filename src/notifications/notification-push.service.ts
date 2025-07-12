import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationMongo, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(NotificationMongo.name, 'mongodb')
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(notificationData: {
    userId: string;
    title: string;
    message: string;
    type: string;
    priority?: string;
    data?: any;
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: Date;
  }) {
    const notification = new this.notificationModel({
      ...notificationData,
      createdAt: new Date()
    });

    await notification.save();
    return notification;
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId })
    ]);

    const unreadCount = await this.notificationModel.countDocuments({ 
      userId, 
      read: false 
    });

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    return result;
  }

  async deleteNotification(notificationId: string, userId: string) {
    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      userId
    });

    return result;
  }

  async getNotificationStats(userId: string) {
    const stats = await this.notificationModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              read: '$read'
            }
          }
        }
      }
    ]);

    return stats[0] || { total: 0, unread: 0, byType: [] };
  }

  // Crear notificaciones automáticas para eventos del sistema
  async createOrderNotification(userId: string, orderData: any) {
    return this.createNotification({
      userId,
      title: 'Nuevo Pedido Confirmado',
      message: `Tu pedido #${orderData.orderNumber} ha sido confirmado`,
      type: 'success',
      priority: 'high',
      data: { orderId: orderData.id, orderNumber: orderData.orderNumber },
      actionUrl: `/orders/${orderData.id}`
    });
  }

  async createPromotionNotification(userId: string, promotionData: any) {
    return this.createNotification({
      userId,
      title: 'Nueva Promoción Disponible',
      message: promotionData.message,
      type: 'promotion',
      priority: 'medium',
      data: promotionData,
      actionUrl: promotionData.actionUrl,
      imageUrl: promotionData.imageUrl,
      expiresAt: promotionData.expiresAt
    });
  }

  async createStockNotification(userId: string, productData: any) {
    return this.createNotification({
      userId,
      title: 'Producto Disponible',
      message: `${productData.name} está nuevamente disponible`,
      type: 'info',
      priority: 'medium',
      data: { productId: productData.id, productName: productData.name },
      actionUrl: `/products/${productData.id}`,
      imageUrl: productData.image
    });
  }
}
