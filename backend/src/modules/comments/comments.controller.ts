import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: [CommentResponseDto],
  })
  async getComments(): Promise<CommentResponseDto[]> {
    return this.commentsService.getComments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific comment' })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async getComment(@Param('id') id: string): Promise<CommentResponseDto> {
    return this.commentsService.getComment(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Parent comment not found' })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    return this.commentsService.createComment(createCommentDto, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not your comment or time expired' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    return this.commentsService.updateComment(id, updateCommentDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your comment or time expired' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<void> {
    return this.commentsService.deleteComment(id, req.user);
  }

  @Post(':id/undo-delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Undo comment deletion' })
  @ApiResponse({
    status: 200,
    description: 'Comment restored successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not your comment or time expired' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async undoDeleteComment(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<CommentResponseDto> {
    return this.commentsService.undoDeleteComment(id, req.user);
  }
} 