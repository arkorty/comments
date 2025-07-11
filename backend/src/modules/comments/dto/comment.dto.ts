import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a great comment!' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @ApiProperty({ required: false, example: 'parent-comment-id' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment content' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  author: {
    id: string;
    username: string;
  };

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  canEdit: boolean;

  @ApiProperty()
  canDelete: boolean;

  @ApiProperty()
  canUndoDelete: boolean;

  @ApiProperty({ type: [CommentResponseDto] })
  children: CommentResponseDto[];
} 