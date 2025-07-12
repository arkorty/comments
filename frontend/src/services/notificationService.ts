import { backgroundAPI } from './api';

class NotificationService {
  private checkInterval: NodeJS.Timeout | null = null;
  private lastUnreadCount = 0;
  private isRunning = false;
  private isInitialLoad = true;
  private toastCallback: ((message: string, type: 'info' | 'success' | 'error') => void) | null = null;

  startBackgroundChecking(toastCallback: (message: string, type: 'info' | 'success' | 'error') => void) {
    if (this.isRunning) return;
    
    this.toastCallback = toastCallback;
    this.isRunning = true;
    this.isInitialLoad = true;
    
    // Check immediately but don't trigger notifications on initial load
    this.checkForNewNotifications();
    
    // Then check every 1 second for faster response
    this.checkInterval = setInterval(() => {
      this.checkForNewNotifications();
    }, 1000);
  }

  stopBackgroundChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    this.toastCallback = null;
  }

  private async checkForNewNotifications() {
    try {
      // Use the more efficient unread count endpoint for faster response
      const count = await backgroundAPI.getUnreadCount();
      
      // On initial load, just set the baseline count without triggering notifications
      if (this.isInitialLoad) {
        this.lastUnreadCount = count;
        this.isInitialLoad = false;
        return;
      }
      
      // Disabled: Only show notifications for replies (handled by Notifications component)
      // and welcome messages (handled by App component)
      // if (count > 0 && count > this.lastUnreadCount) {
      //   const newCount = count - this.lastUnreadCount;
      //   if (this.toastCallback) {
      //     this.toastCallback(
      //       `${newCount} new notification${newCount > 1 ? 's' : ''}`,
      //       'info'
      //     );
      //   }
      // }
      
      this.lastUnreadCount = count;
    } catch (error) {
      console.error('Background notification check failed:', error);
    }
  }

  resetUnreadCount() {
    this.lastUnreadCount = 0;
  }

  // Manual trigger for immediate notification check
  async checkNow() {
    await this.checkForNewNotifications();
  }
}

// Create singleton instance
export const notificationService = new NotificationService(); 
