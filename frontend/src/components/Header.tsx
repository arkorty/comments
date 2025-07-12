import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../services/api';
import { Megaphone } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
  isAuthenticated: boolean;
  user: User | null;
  onViewChange: (view: 'comments' | 'notifications' | 'login' | 'register') => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, user, onViewChange }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onViewChange('login');
  };

  return (
    <header className="bg-bg-secondary border-b border-border px-4 py-2">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="cursor-pointer" onClick={() => onViewChange('comments')}>
          <h1 className="text-lg ml-4 font-semibold text-fg-primary font-mono hover:text-accent-hover transition-colors">
            Comments — <a 
              href="https://webark.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/70 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              WebArk
            </a>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button 
                className="w-10 h-10 bg-bg-tertiary text-fg-primary border border-border rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-bg-secondary hover:border-border-light disabled:opacity-50"
                onClick={() => onViewChange('notifications')}
                aria-label="Notifications"
              >
                <Megaphone className="w-5 h-5" />
              </button>
              <button 
                className="w-16 h-10 bg-error text-white text-[12px] rounded hover:bg-red-500 transition-colors flex items-center justify-center"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-accent text-bg-primary rounded text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-accent-hover disabled:opacity-50"
                onClick={() => onViewChange('login')}
              >
                Login
              </button>
              <button 
                className="px-4 py-2 bg-bg-tertiary text-fg-primary border border-border rounded text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-bg-secondary hover:border-border-light disabled:opacity-50"
                onClick={() => onViewChange('register')}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 
