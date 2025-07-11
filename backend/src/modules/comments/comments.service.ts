import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from './dto/comment.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: TreeRepository<Comment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<CommentResponseDto> {
    const { content, parentId } = createCommentDto;

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentId, isDeleted: false },
        relations: ['author'],
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Create notification for parent comment author
      if (parentComment.authorId !== user.id) {
        await this.notificationsService.createNotification({
          userId: parentComment.authorId,
          triggeredById: user.id,
          commentId: parentComment.id,
          type: NotificationType.REPLY,
          message: `${user.username} replied to your comment`,
        });
      }
    }

    // Create new comment
    const comment = this.commentRepository.create({
      content,
      parentId,
      authorId: user.id,
      author: user,
    });

    const savedComment = await this.commentRepository.save(comment);

    return this.transformToResponseDto(savedComment);
  }

  async getComments(): Promise<CommentResponseDto[]> {
    // Get all comments with their authors
    const allComments = await this.commentRepository.find({
      relations: ['author'],
      order: { createdAt: 'ASC' }
    });

    // Build the tree structure
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create a map of all comments
    allComments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        children: []
      });
    });

    // Second pass: build the tree structure
    allComments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    // Return all root comments (including deleted ones) so frontend can handle permissions
    return rootComments.map(comment => this.transformToResponseDto(comment));
  }

  async getComment(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'children', 'children.author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.transformToResponseDto(comment);
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // Check if comment can be edited using helper function
    const canEdit = (comment: any): boolean => {
      const now = new Date();
      const editDeadline = new Date(comment.createdAt.getTime() + 15 * 60 * 1000); // 15 minutes
      return now <= editDeadline;
    };

    if (!canEdit(comment)) {
      throw new ForbiddenException('Comment can only be edited within 15 minutes of creation');
    }

    comment.content = updateCommentDto.content;
    const updatedComment = await this.commentRepository.save(comment);

    return this.transformToResponseDto(updatedComment);
  }

  async deleteComment(id: string, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Check if comment can be deleted using helper function
    const canDelete = (comment: any): boolean => {
      const now = new Date();
      const deleteDeadline = new Date(comment.createdAt.getTime() + 15 * 60 * 1000); // 15 minutes
      return now <= deleteDeadline;
    };

    if (!canDelete(comment)) {
      throw new ForbiddenException('Comment can only be deleted within 15 minutes of creation');
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await this.commentRepository.save(comment);
  }

  async undoDeleteComment(id: string, user: User): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== user.id) {
      throw new ForbiddenException('You can only undo deletion of your own comments');
    }

    // Check if comment can be restored using helper function
    const canUndoDelete = (comment: any): boolean => {
      if (!comment.isDeleted || !comment.deletedAt) return false;
      const now = new Date();
      const undoDeadline = new Date(comment.deletedAt.getTime() + 15 * 60 * 1000); // 15 minutes
      return now <= undoDeadline;
    };

    if (!canUndoDelete(comment)) {
      throw new ForbiddenException('Comment can only be restored within 15 minutes of deletion');
    }

    comment.isDeleted = false;
    comment.deletedAt = null;
    const restoredComment = await this.commentRepository.save(comment);

    return this.transformToResponseDto(restoredComment);
  }

  private transformToResponseDto(comment: Comment | any): CommentResponseDto {
    // Helper functions to check permissions for plain objects
    const canEdit = (comment: any): boolean => {
      const now = new Date();
      const editDeadline = new Date(comment.createdAt.getTime() + 15 * 60 * 1000); // 15 minutes
      return now <= editDeadline;
    };

    const canDelete = (comment: any): boolean => {
      const now = new Date();
      const deleteDeadline = new Date(comment.createdAt.getTime() + 15 * 60 * 1000); // 15 minutes
      return now <= deleteDeadline;
    };

    const canUndoDelete = (comment: any): boolean => {
      if (!comment.isDeleted || !comment.deletedAt) return false;
      const now = new Date();
      const undoDeadline = new Date(comment.deletedAt.getTime() + 15 * 60 * 1000); // 15 minutes
      return now <= undoDeadline;
    };

    // Always use helper functions since we're dealing with plain objects from the tree building
    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      author: {
        id: comment.author.id,
        username: comment.author.username,
      },
      parentId: comment.parentId,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      canEdit: canEdit(comment),
      canDelete: canDelete(comment),
      canUndoDelete: canUndoDelete(comment),
      children: comment.children ? comment.children.map(child => this.transformToResponseDto(child)) : [],
    };
  }
} 