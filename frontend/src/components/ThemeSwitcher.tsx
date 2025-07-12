import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Palette, 
  Zap, 
  Monitor, 
  Terminal,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'gruvbox', name: 'Gruvbox', icon: Palette },
    { id: 'dracula', name: 'Dracula', icon: Zap },
    { id: 'onedark', name: 'One Dark', icon: Monitor },
    { id: 'xterm', name: 'Xterm', icon: Terminal },
  ] as const;

  const currentTheme = themes.find(t => t.id === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  const handleThemeSelect = (themeId: typeof themes[number]['id']) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-bg-tertiary text-fg-primary border border-border rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-bg-secondary hover:border-border-light disabled:opacity-50"
        aria-label={`Current theme: ${theme}. Click to select theme.`}
        title={`Current theme: ${theme}. Click to select theme.`}
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-bg-secondary border border-border rounded-md shadow-lg z-50 min-w-[140px]">
          {themes.map((themeOption) => {
            const IconComponent = themeOption.icon;
            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeSelect(themeOption.id)}
                className={`w-full px-3 py-2 text-left text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-bg-tertiary flex items-center gap-2 ${
                  theme === themeOption.id 
                    ? 'bg-accent text-bg-primary' 
                    : 'text-fg-primary'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{themeOption.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSwitcher; 
