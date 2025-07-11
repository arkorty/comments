import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const loginMutation = useMutation(authAPI.login, {
    onSuccess: (response) => {
      login(response.data.accessToken, response.data.user);
      if (onLoginSuccess) onLoginSuccess(response.data.user.username);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-md p-6 w-full max-w-md shadow-custom">
      <h2 className="mb-4 text-accent text-lg font-semibold">Login</h2>
      {error && (
        <div className="text-error bg-red-900/20 border border-red-500/30 rounded p-3 mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-xs text-fg-secondary uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-fg-primary text-sm font-sans focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(0,212,255,0.2)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1 text-xs text-fg-secondary uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-fg-primary text-sm font-sans focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(0,212,255,0.2)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full px-4 py-2 bg-accent text-bg-primary rounded text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-accent-hover disabled:opacity-50"
          disabled={loginMutation.isLoading}
        >
          {loginMutation.isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-5 text-fg-secondary">
        Don't have an account?{' '}
        <button 
          className="text-accent hover:text-accent-hover underline cursor-pointer"
          onClick={onSwitchToRegister}
        >
          Register
        </button>
      </p>
    </div>
  );
};

export default Login; 