import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastClasses = () => {
    const baseClasses = "px-4 py-3 rounded text-sm font-medium max-w-xs shadow-custom animate-slideIn";
    
    const typeClasses = {
      success: "bg-success text-bg-primary",
      error: "bg-error text-white",
      info: "bg-accent text-bg-primary",
      warning: "bg-warning text-bg-primary",
    };

    return `${baseClasses} ${typeClasses[type]}`;
  };

  return (
    <div className={getToastClasses()}>
      {message}
    </div>
  );
};

export default Toast; 