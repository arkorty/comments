import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { commentsAPI, Comment as CommentType } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import CreateCommentForm from './CreateCommentForm';

interface CommentItemProps {
  comment: CommentType;
  onUpdate: () => void;
  filterDeleted?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onUpdate, filterDeleted = false }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const updateCommentMutation = useMutation(
    (data: { id: string; content: string }) => commentsAPI.updateComment(data.id, { content: data.content }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('comments');
        onUpdate();
        setIsEditing(false);
      },
    }
  );

  const deleteCommentMutation = useMutation(
    (id: string) => commentsAPI.deleteComment(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('comments');
        onUpdate();
      },
    }
  );

  const undoDeleteMutation = useMutation(
    (id: string) => commentsAPI.undoDeleteComment(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('comments');
        onUpdate();
      },
    }
  );

  const createReplyMutation = useMutation(commentsAPI.createComment, {
    onSuccess: () => {
      queryClient.invalidateQueries('comments');
      onUpdate();
      setShowReplyForm(false);
    },
  });

  const handleEdit = () => {
    updateCommentMutation.mutate({ id: comment.id, content: editContent });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(comment.id);
    }
  };

  const handleUndoDelete = () => {
    undoDeleteMutation.mutate(comment.id);
  };

  const handleReply = (data: { content: string; parentId?: string }) => {
    createReplyMutation.mutate({ ...data, parentId: comment.id });
  };

  if (comment.isDeleted) {
    return (
      <div className="bg-bg-secondary border border-border rounded-md p-4 opacity-60">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-0">
          <span className="text-accent font-medium">{comment.author.username}</span>
          <span 
            className="text-xs text-fg-muted"
            title={format(new Date(comment.createdAt), "yyyy-MM-dd HH:mm:ss 'UTC'")}
          >
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="text-fg-secondary mb-3">
          <em>[Comment deleted]</em>
        </div>
        {user?.id === comment.authorId && (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-success text-bg-primary rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-green-400 disabled:opacity-50"
              onClick={handleUndoDelete}
              disabled={!comment.canUndoDelete}
              title={!comment.canUndoDelete ? 'You can only restore within 15 minutes of deletion.' : ''}
            >
              Undo Delete
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-md p-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-0">
        <span className="text-accent font-medium">{comment.author.username}</span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span 
            className="text-xs text-fg-muted self-end sm:self-auto"
            title={format(new Date(comment.createdAt), "yyyy-MM-dd HH:mm:ss 'UTC'")}
          >
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {isEditing ? (
        <div className="mb-3">
          <textarea
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-fg-primary text-sm font-sans focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(0,212,255,0.2)] resize-none mb-3"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 bg-accent text-bg-primary rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-accent-hover"
              onClick={handleEdit}
            >
              Save
            </button>
            <button 
              className="px-3 py-1 bg-bg-tertiary text-fg-primary border border-border rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-bg-secondary hover:border-border-light"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-fg-primary mb-3 leading-relaxed">{comment.content}</div>
      )}

      <div className="flex gap-2 flex-wrap">
        {user && (
          <button 
            className="px-3 py-1 bg-bg-tertiary text-fg-primary border border-border rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-bg-secondary hover:border-border-light"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </button>
        )}
        {user?.id === comment.authorId && (
          <button
            className="px-3 py-1 bg-accent text-bg-primary rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-accent-hover disabled:opacity-50"
            onClick={() => setIsEditing(true)}
            disabled={!comment.canEdit || isEditing}
            title={!comment.canEdit ? 'You can only edit within 15 minutes of posting.' : ''}
          >
            Edit
          </button>
        )}
        {user?.id === comment.authorId && (
          <button
            className="px-3 py-1 bg-error/90 border border-error text-white rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-red-500 disabled:opacity-50"
            onClick={handleDelete}
            disabled={!comment.canDelete}
            title={!comment.canDelete ? 'You can only delete within 15 minutes of posting.' : ''}
          >
            Delete
          </button>
        )}
      </div>

      {showReplyForm && user && (
        <div className="mt-4">
          <CreateCommentForm
            onSubmit={handleReply}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {comment.children && comment.children.length > 0 && (
        <div className="mt-4 ml-8 border-l-2 border-border pl-4 space-y-4">
          {comment.children
            .filter((child) => !filterDeleted || !child.isDeleted)
            .map((child) => (
              <CommentItem 
                key={child.id} 
                comment={child} 
                onUpdate={onUpdate} 
                filterDeleted={filterDeleted}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem; 
