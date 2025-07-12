import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = NotificationMongo & Document;

@Schema({ 
  timestamps: true,
  collection: 'notifications'
})
export class NotificationMongo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  type: string; // 'info', 'success', 'warning', 'error', 'promotion'

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: 'low' })
  priority: string; // 'low', 'medium', 'high', 'urgent'

  @Prop({ type: Object })
  data?: Record<string, any>;

  @Prop()
  actionUrl?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  readAt?: Date;
}

export const NotificationMongoSchema = SchemaFactory.createForClass(NotificationMongo);
