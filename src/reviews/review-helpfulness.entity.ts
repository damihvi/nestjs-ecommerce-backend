import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Review } from './review.entity';

@Entity('review_helpfulness')
@Unique(['userId', 'reviewId'])
export class ReviewHelpfulness {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column('uuid')
  reviewId: string;

  @Column({ default: true })
  isHelpful: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
