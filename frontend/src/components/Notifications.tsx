import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { formatDistanceToNow } from 'date-fns';
import { notificationsAPI, Notification as NotificationType } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';

interface NotificationsProps {
  onNewContent?: (message: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onNewContent }) => {
  const [showHidden, setShowHidden] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const previousNotificationsRef = useRef<NotificationType[]>([]);
  const previousUnreadCountRef = useRef<number>(0);

  const {
    data: notificationsResponse,
    isLoading,
    error,
    refetch
  } = useQuery('notifications', notificationsAPI.getNotifications, {
    refetchInterval: 1000, // Auto-refresh every 1 second
    staleTime: 500,
    enabled: isAuthenticated, // Only run query if authenticated
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const {
    data: unreadCountResponse
  } = useQuery('unreadCount', notificationsAPI.getUnreadCount, {
    refetchInterval: 1000, // Auto-refresh every 1 second
    staleTime: 500,
    enabled: isAuthenticated, // Only run query if authenticated
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Memoize notifications to prevent unnecessary re-renders
  const notifications = useMemo(() => notificationsResponse?.data || [], [notificationsResponse?.data]);
  const unreadCount = useMemo(() => unreadCountResponse?.data || { count: 0 }, [unreadCountResponse?.data]);

  // Check for new notifications and show toast
  useEffect(() => {
    if (notifications.length > 0 && previousNotificationsRef.current.length > 0) {
      const newNotifications = notifications.filter(notification => 
        !previousNotificationsRef.current.some(prev => prev.id === notification.id)
      );
      
      // Only show notification for new replies, not general notifications
      if (newNotifications.length > 0 && onNewContent) {
        const replyNotifications = newNotifications.filter(n => n.type === 'reply');
        if (replyNotifications.length > 0) {
          onNewContent(`${replyNotifications.length} new reply${replyNotifications.length > 1 ? 's' : ''} received`);
        }
      }
    }
    previousNotificationsRef.current = notifications;
  }, [notifications, onNewContent]);

  // Remove the unread count notification effect - let the notification service handle this
  // useEffect(() => {
  //   if (previousUnreadCountRef.current > 0 && unreadCount.count > previousUnreadCountRef.current && onNewContent) {
  //     const newUnread = unreadCount.count - previousUnreadCountRef.current;
  //     onNewContent(`${newUnread} new unread notification${newUnread > 1 ? 's' : ''}`);
  //   }
  //   previousUnreadCountRef.current = unreadCount.count;
  // }, [unreadCount.count, onNewContent]);

  // Reset notification service unread count when notifications are viewed
  useEffect(() => {
    notificationService.resetUnreadCount();
  }, []);

  const markAsReadMutation = useMutation(notificationsAPI.markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unreadCount');
    },
  });

  const markAllAsReadMutation = useMutation(notificationsAPI.markAllAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unreadCount');
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const filteredNotifications = showHidden 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const stats = {
    total: notifications.length,
    unread: unreadCount.count,
    read: notifications.length - unreadCount.count,
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-error bg-red-900/20 border border-red-500/30 rounded p-3 mb-4">
          Failed to load notifications
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
      {/* Notifications Header */}
      <div className="bg-bg-secondary border border-border rounded-md p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-accent">Notifications</h2>
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="text-fg-secondary uppercase tracking-wider">Total:</span>
                <span className="text-fg-primary font-mono">{stats.total}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-fg-secondary uppercase tracking-wider">Unread:</span>
                <span className={`font-mono ${stats.unread > 0 ? 'text-accent' : 'text-fg-primary'}`}>
                  {stats.unread}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-fg-secondary uppercase tracking-wider">Read:</span>
                <span className="text-fg-primary font-mono">{stats.read}</span>
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHidden(!showHidden)}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans ${
                  showHidden 
                    ? 'bg-accent text-bg-primary hover:bg-accent-hover' 
                    : 'bg-bg-tertiary text-fg-primary border border-border hover:bg-bg-secondary hover:border-border-light'
                }`}
              >
                {showHidden ? 'Hide Read' : 'SHOW READ'}
              </button>
            </div>
            
            {stats.unread > 0 && (
              <button 
                className="px-3 py-1 bg-bg-tertiary text-fg-primary border border-border rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-bg-secondary hover:border-border-light disabled:opacity-50"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isLoading}
              >
                Mark All Read
              </button>
            )}
            
            <button 
              className="px-3 py-1 bg-bg-tertiary text-fg-primary border border-border rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-bg-secondary hover:border-border-light disabled:opacity-50"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? '↻' : '↻'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-fg-secondary text-sm">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-fg-secondary">
            <span>
              {showHidden ? 'No notifications yet.' : 'No unread notifications.'}
            </span>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-bg-secondary border border-border rounded-md p-4 hover:bg-bg-tertiary transition-colors ${!notification.isRead ? 'border-accent/30' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded uppercase tracking-wider">
                  {notification.type}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fg-muted">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  {!notification.isRead && (
                    <span className="text-accent text-sm">●</span>
                  )}
                </div>
              </div>
              
              <div className="text-fg-primary mb-3">
                <div className="text-sm leading-relaxed">{notification.message}</div>
                                 {notification.triggeredBy && (
                   <div className="text-xs text-fg-secondary mt-1">
                     by <span className="text-accent">{notification.triggeredBy.username}</span>
                   </div>
                 )}
              </div>
              
              {!notification.isRead && (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-accent text-bg-primary rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-accent-hover"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark Read
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border pt-4">
        <div className="flex flex-wrap gap-4 text-xs text-fg-secondary">
          <span>
            Showing {filteredNotifications.length} of {stats.total} notifications
          </span>
          {stats.unread > 0 && (
            <span className="text-accent">
              ({stats.unread} unread)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 
