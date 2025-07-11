import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: (username: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const registerMutation = useMutation(authAPI.register, {
    onSuccess: (response) => {
      login(response.data.accessToken, response.data.user);
      if (onRegisterSuccess) onRegisterSuccess(response.data.user.username);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    registerMutation.mutate({ username, email, password });
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-md p-6 w-full max-w-md shadow-custom">
      <h2 className="mb-4 text-accent text-lg font-semibold">Register</h2>
      {error && (
        <div className="text-error bg-red-900/20 border border-red-500/30 rounded p-3 mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1 text-xs text-fg-secondary uppercase tracking-wider">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-fg-primary text-sm font-sans focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(0,212,255,0.2)]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
          />
        </div>
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
            minLength={6}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-1 text-xs text-fg-secondary uppercase tracking-wider">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded text-fg-primary text-sm font-sans focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_rgba(0,212,255,0.2)]"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full px-4 py-2 bg-accent text-bg-primary rounded text-xs font-medium cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans hover:bg-accent-hover disabled:opacity-50"
          disabled={registerMutation.isLoading}
        >
          {registerMutation.isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="text-center mt-5 text-fg-secondary">
        Already have an account?{' '}
        <button 
          className="text-accent hover:text-accent-hover underline cursor-pointer"
          onClick={onSwitchToLogin}
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default Register; 