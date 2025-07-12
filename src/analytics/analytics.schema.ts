import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsDocument = Analytics & Document;

@Schema({ 
  timestamps: true,
  collection: 'analytics'
})
export class Analytics {
  @Prop({ required: true })
  eventType: string; // 'page_view', 'product_view', 'purchase', 'click', etc.

  @Prop({ required: true })
  eventName: string;

  @Prop({ type: Object })
  eventData?: Record<string, any>;

  @Prop()
  userId?: string;

  @Prop()
  sessionId?: string;

  @Prop()
  productId?: string;

  @Prop()
  categoryId?: string;

  @Prop()
  page?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;

  @Prop()
  country?: string;

  @Prop()
  city?: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  revenue?: number;

  @Prop()
  quantity?: number;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
