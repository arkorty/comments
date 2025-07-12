import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { notificationService } from './services/notificationService';
import { ThemeProvider } from './hooks/useTheme';
import { notificationsAPI, Notification as NotificationType } from './services/api';
import { useQuery } from 'react-query';
import Header from './components/Header';
import Comments from './components/Comments';
import Notifications from './components/Notifications';
import Login from './components/Login';
import Register from './components/Register';
import ToastContainer from './components/ToastContainer';

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toasts, removeToast, showInfo, showError } = useToast();
  const [activeView, setActiveView] = useState<'comments' | 'notifications' | 'login' | 'register'>('comments');
  const [systemStatus, setSystemStatus] = useState<{
    backend: boolean;
    db: boolean;
    lastSync: Date | null;
  }>({
    backend: false,
    db: false,
    lastSync: null,
  });

  // Track previous notifications for reply detection
  const previousNotificationsRef = useRef<NotificationType[]>([]);

  // Check for new reply notifications globally
  const { data: notificationsResponse } = useQuery('notifications', notificationsAPI.getNotifications, {
    refetchInterval: 1000,
    staleTime: 500,
    enabled: isAuthenticated,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const notifications = useMemo(() => notificationsResponse?.data || [], [notificationsResponse?.data]);

  // Check for new reply notifications
  useEffect(() => {
    if (notifications.length > 0 && previousNotificationsRef.current.length > 0) {
      const newNotifications = notifications.filter((notification: NotificationType) => 
        !previousNotificationsRef.current.some(prev => prev.id === notification.id)
      );
      
      // Only show notification for new replies
      if (newNotifications.length > 0) {
        const replyNotifications = newNotifications.filter((n: NotificationType) => n.type === 'reply');
        if (replyNotifications.length > 0) {
          showInfo(`${replyNotifications.length} new reply${replyNotifications.length > 1 ? 's' : ''} received`);
        }
      }
    }
    previousNotificationsRef.current = notifications;
  }, [notifications, showInfo]);

  // Memoize system health check to prevent unnecessary re-renders
  const checkSystemHealth = useMemo(() => async () => {
    try {
      const response = await fetch('https://comments.webark.in/api/docs');
      setSystemStatus(prev => ({ ...prev, backend: response.ok, lastSync: new Date() }));
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, backend: false, lastSync: new Date() }));
    }
  }, []);

  // System health check
  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [checkSystemHealth]);

  // Start/stop background notification checking based on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      // Start background notification checking
      notificationService.startBackgroundChecking((message, type) => {
        if (type === 'info') {
          showInfo(message);
        } else if (type === 'error') {
          showError(message);
        }
      });
      // Check for notifications immediately
      notificationService.checkNow();
    } else {
      // Stop background checking when not authenticated
      notificationService.stopBackgroundChecking();
    }
    // Cleanup on unmount
    return () => {
      notificationService.stopBackgroundChecking();
    };
  }, [isAuthenticated, user, showInfo, showError]);

  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-fg-secondary font-mono text-xs uppercase tracking-wider">Initializing...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          {activeView === 'login' ? (
            <Login 
              onSwitchToRegister={() => setActiveView('register')} 
              onLoginSuccess={(username: string) => {
                setActiveView('comments');
                window.location.href = '/?greet=true';
              }}
            />
          ) : (
            <Register 
              onSwitchToLogin={() => setActiveView('login')} 
              onRegisterSuccess={(username: string) => {
                setActiveView('comments');
                window.location.href = '/?greet=true';
              }}
            />
          )}
        </div>
      );
    }

    return (
      <>
        {activeView === 'comments' && <Comments onNewContent={showInfo} />}
        {activeView === 'notifications' && <Notifications onNewContent={showInfo} />}
      </>
    );
  }, [isLoading, isAuthenticated, activeView, showInfo]);

  // Check for and show welcome message from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldGreet = urlParams.get('greet');
    if (shouldGreet === 'true' && user) {
      showInfo(`Welcome back, ${user.username}!`);
      // Clean up the URL by removing the greet parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('greet');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [showInfo, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-fg-secondary font-mono text-xs uppercase tracking-wider">Initializing...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        
        {/* System Status Bar */}
        <div className="bg-bg-secondary border-b border-border px-3 py-1 flex items-center gap-4 text-xs font-mono text-fg-secondary">
          <div className="flex items-center gap-1">
            <span
                          className={`w-3 h-3 rounded-full inline-block align-middle ${systemStatus.backend
              ? 'bg-red-600 border border-red-700'
              : 'bg-transparent border border-fg-secondary'}`}
            ></span>
            <span className="text-[10px] uppercase tracking-wider">API {`${systemStatus.backend ? 'ONLINE' : 'OFFLINE'}`}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider">LAST CHECK: {systemStatus.lastSync ? systemStatus.lastSync.toUTCString().split(' ')[4] + ' UTC' : 'N/A'}</span>
          </div>
          {user && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider">User: {user.username}</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header 
            isAuthenticated={isAuthenticated} 
            user={user}
            onViewChange={setActiveView}
          />
          
          <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
            {mainContent}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App; 
