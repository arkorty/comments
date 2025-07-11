import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
@Tree("closure-table")
@Index(['parentId'])
@Index(['authorId'])
@Index(['createdAt'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  parentId: string;

  @Column()
  authorId: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Tree relationships
  @TreeChildren()
  children: Comment[];

  @TreeParent()
  parent: Comment;

  // User relationship
  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  // Helper methods
  canEdit(): boolean {
    const now = new Date();
    const editDeadline = new Date(this.createdAt.getTime() + 15 * 60 * 1000); // 15 minutes
    return now <= editDeadline;
  }

  canDelete(): boolean {
    const now = new Date();
    const deleteDeadline = new Date(this.createdAt.getTime() + 15 * 60 * 1000); // 15 minutes
    return now <= deleteDeadline;
  }

  canUndoDelete(): boolean {
    if (!this.isDeleted || !this.deletedAt) return false;
    const now = new Date();
    const undoDeadline = new Date(this.deletedAt.getTime() + 15 * 60 * 1000); // 15 minutes
    return now <= undoDeadline;
  }
} 