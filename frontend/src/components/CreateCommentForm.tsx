import React, { useState } from 'react';

interface CreateCommentFormProps {
  onSubmit: (data: { content: string; parentId?: string }) => void;
  placeholder?: string;
}

const CreateCommentForm: React.FC<CreateCommentFormProps> = ({ 
  onSubmit, 
  placeholder = "Write a comment..." 
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ content: content.trim() });
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border rounded-md p-4">
      <div className="mb-4">
        <textarea
          className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-fg-primary text-sm font-sans focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(0,212,255,0.2)] resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={2}
          required
        />
      </div>
      <div className="flex justify-end">
        <button 
          type="submit" 
          className="px-4 py-2 bg-accent text-bg-primary rounded text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-accent-hover disabled:opacity-50"
          disabled={!content.trim()}
        >
          Post
        </button>
      </div>
    </form>
  );
};

export default CreateCommentForm; 