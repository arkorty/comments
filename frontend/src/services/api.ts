import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://comments.webark.in/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    hasToken: !!token,
    baseURL: config.baseURL
  });
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
  };
  parentId?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
  canUndoDelete: boolean;
  children: Comment[];
}

export interface CreateCommentData {
  content: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authAPI = {
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
};

export interface Notification {
  id: string;
  userId: string;
  triggeredById?: string;
  commentId?: string;
  type: 'reply' | 'mention';
  isRead: boolean;
  message: string;
  createdAt: string;
  triggeredBy?: User;
  comment?: Comment;
}

export const commentsAPI = {
  getComments: () => api.get<Comment[]>('/comments'),
  getComment: (id: string) => api.get<Comment>(`/comments/${id}`),
  createComment: (data: CreateCommentData) => api.post<Comment>('/comments', data),
  updateComment: (id: string, data: UpdateCommentData) => api.put<Comment>(`/comments/${id}`, data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
  undoDeleteComment: (id: string) => api.post<Comment>(`/comments/${id}/undo-delete`),
};

export const notificationsAPI = {
  getNotifications: () => api.get<Notification[]>('/notifications'),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => api.post<Notification>(`/notifications/${id}/read`),
  markAllAsRead: () => api.post<{ message: string }>('/notifications/mark-all-read'),
};

// Background notification checking functions
export const backgroundAPI = {
  checkNotifications: async (): Promise<{ count: number; notifications: Notification[] }> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { count: 0, notifications: [] };
      
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const unreadCount = response.data.filter((n: Notification) => !n.isRead).length;
      return { count: unreadCount, notifications: response.data };
    } catch (error) {
      console.error('Background notification check failed:', error);
      return { count: 0, notifications: [] };
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      
      const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.count;
    } catch (error) {
      console.error('Unread count check failed:', error);
      return 0;
    }
  }
};

export default api; 
