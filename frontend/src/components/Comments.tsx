import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { commentsAPI } from '../services/api';
import { Comment as CommentType } from '../services/api';
import CommentItem from './CommentItem';
import CreateCommentForm from './CreateCommentForm';

interface CommentsProps {
  onNewContent?: (message: string) => void;
}

const Comments: React.FC<CommentsProps> = ({ onNewContent }) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'replies'>('newest');
  const [showDeleted, setShowDeleted] = useState(false);
  const queryClient = useQueryClient();
  const previousCommentsRef = useRef<CommentType[]>([]);

  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useQuery('comments', commentsAPI.getComments, {
    refetchInterval: 1000, // Auto-refresh every 1 second
    staleTime: 500,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Memoize comments to prevent unnecessary re-renders
  const comments = useMemo(() => response?.data || [], [response?.data]);

  // Track previous comments for comparison
  useEffect(() => {
    previousCommentsRef.current = comments;
  }, [comments]);

  const createCommentMutation = useMutation(commentsAPI.createComment, {
    onSuccess: () => {
      queryClient.invalidateQueries('comments');
    },
  });

  const handleCreateComment = (data: { content: string; parentId?: string }) => {
    createCommentMutation.mutate(data);
  };

  const rootComments = useMemo(() => {
    let roots = comments;
    if (!showDeleted) {
      roots = roots.filter((comment: CommentType) => !comment.isDeleted);
    }
    roots = roots.slice(); // shallow copy for sorting
    roots.sort((a: CommentType, b: CommentType) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'replies':
          return (b.children?.length || 0) - (a.children?.length || 0);
        default:
          return 0;
      }
    });
    return roots;
  }, [comments, showDeleted, sortBy]);

  const stats = {
    total: comments.length,
    deleted: comments.filter(c => c.isDeleted).length,
    replies: comments.reduce((sum, c) => sum + (c.children?.length || 0), 0),
    active: comments.filter(c => !c.isDeleted).length,
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-error bg-red-900/20 border border-red-500/30 rounded p-3 mb-4">
          Failed to load comments
        </div>
        <button 
          className="px-4 py-2 bg-bg-tertiary text-fg-primary border border-border rounded text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-bg-secondary hover:border-border-light disabled:opacity-50"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments Header with Stats */}
      <div className="bg-bg-secondary border border-border rounded-md p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-wrap text-xs sm:flex-row sm:items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="text-fg-secondary uppercase tracking-wider">Total:</span>
                <span className="text-fg-primary font-mono">{stats.total}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-fg-secondary uppercase tracking-wider">Active:</span>
                <span className="text-fg-primary font-mono">{stats.active}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-fg-secondary uppercase tracking-wider">Replies:</span>
                <span className="text-fg-primary font-mono">{stats.replies}</span>
              </span>
              {stats.deleted > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-fg-secondary uppercase tracking-wider">Deleted:</span>
                  <span className="text-error font-mono">{stats.deleted}</span>
                </span>
              )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-fg-secondary uppercase tracking-wider">Sort:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 bg-bg-tertiary border border-border rounded text-xs text-fg-primary font-sans focus:outline-none focus:border-accent"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="replies">Most Replies</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans ${
                  showDeleted 
                    ? 'bg-accent text-bg-primary hover:bg-accent-hover' 
                    : 'bg-bg-tertiary text-fg-primary border border-border hover:bg-bg-secondary hover:border-border-light'
                }`}
              >
                {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Comment Form */}
      <CreateCommentForm onSubmit={handleCreateComment} />

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-fg-secondary text-sm">Loading comments...</span>
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-8 text-fg-secondary">
            <span>No comments yet. Be the first to comment!</span>
          </div>
        ) : (
          rootComments.map((comment: CommentType) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={() => queryClient.invalidateQueries('comments')}
              filterDeleted={!showDeleted}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border pt-4">
        <div className="flex flex-wrap gap-4 text-xs text-fg-secondary">
          <span>
            Showing {rootComments.length} of {stats.total} comments
          </span>
          {stats.deleted > 0 && showDeleted && (
            <span>
              ({stats.deleted} deleted)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments; 
