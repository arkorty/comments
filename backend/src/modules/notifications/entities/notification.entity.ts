import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum NotificationType {
  REPLY = 'reply',
  MENTION = 'mention',
}

@Entity('notifications')
@Index(['userId', 'isRead'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  triggeredById: string;

  @Column({ nullable: true })
  commentId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.REPLY,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, (user) => user.triggeredNotifications, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'triggeredById' })
  triggeredBy: User;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;
} 