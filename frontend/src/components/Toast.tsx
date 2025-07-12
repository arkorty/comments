import React, { useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      onClose();
    }, duration);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [duration]); // Only depend on duration, not onClose

  const handleClick = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onClose();
  };

  const getToastClasses = () => {
    const baseClasses = "flex items-center px-4 py-3 rounded text-sm font-medium max-w-xs shadow-custom animate-slideIn";
    
    const typeClasses = {
      success: "bg-success text-bg-primary",
      error: "bg-error text-white",
      info: "bg-accent text-bg-primary",
      warning: "bg-warning text-bg-primary",
    };

    return `${baseClasses} ${typeClasses[type]}`;
  };

  return (
    <div className={getToastClasses()} onClick={handleClick}>
      <Bell className='w-5 mr-2'></Bell>
      {message}
    </div>
  );
};

export default Toast; 
