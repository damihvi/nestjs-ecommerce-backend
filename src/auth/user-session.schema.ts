import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserSessionDocument = UserSession & Document;

@Schema({ 
  timestamps: true,
  collection: 'user_sessions'
})
export class UserSession {
  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop()
  userId?: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  ip: string;

  @Prop()
  country?: string;

  @Prop()
  city?: string;

  @Prop()
  device?: string;

  @Prop()
  browser?: string;

  @Prop()
  os?: string;

  @Prop({ default: Date.now })
  startTime: Date;

  @Prop()
  endTime?: Date;

  @Prop({ default: 0 })
  duration: number; // en segundos

  @Prop({ default: 0 })
  pageViews: number;

  @Prop({ default: 0 })
  actions: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  visitedPages: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
