import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { notificationService } from './services/notificationService';
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

  // Memoize system health check to prevent unnecessary re-renders
  const checkSystemHealth = useMemo(() => async () => {
    try {
      const response = await fetch('http://localhost:3001/api/docs');
      setSystemStatus(prev => ({ ...prev, backend: response.ok, lastSync: new Date() }));
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, backend: false, lastSync: new Date() }));
    }
  }, []);

  // System health check
  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30s
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
                showInfo(`Welcome back, ${username}!`);
                setActiveView('comments');
              }}
            />
          ) : (
            <Register 
              onSwitchToLogin={() => setActiveView('login')} 
              onRegisterSuccess={(username: string) => {
                showInfo(`Welcome, ${username}! Your account has been created.`);
                setActiveView('comments');
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-fg-secondary font-mono text-xs uppercase tracking-wider">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      {/* System Status Bar */}
      <div className="bg-bg-secondary border-b border-border px-3 py-1 flex items-center gap-4 text-xs font-mono text-fg-secondary">
        <div className="flex items-center gap-1">
          <span
            className={`w-3 h-3 rounded-full inline-block align-middle ${systemStatus.backend
              ? 'bg-red-600 border border-red-700'
              : 'bg-transparent border border-black'}`}
            style={{ boxSizing: 'border-box' }}
          ></span>
          <span className="text-[10px] uppercase tracking-wider">API</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider">Last Sync: {systemStatus.lastSync ? systemStatus.lastSync.toUTCString().split(' ')[4] + ' UTC' : 'N/A'}</span>
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
  );
}

export default App; 