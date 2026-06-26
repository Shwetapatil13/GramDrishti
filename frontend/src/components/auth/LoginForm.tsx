import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    // Simulate API call
    setTimeout(() => {
      login(email);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-surface-slate border border-surface-border p-8 rounded-2xl shadow-xl w-full"
    >
      <h2 className="text-heading-lg text-text-primary mb-2 text-2xl">Welcome back</h2>
      <p className="text-body text-text-secondary mb-8">Enter your details to access the dashboard.</p>

      {error && (
        <div className="mb-4 p-3 bg-semantic-danger/10 border border-semantic-danger/30 text-semantic-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">EMAIL</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">PASSWORD</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-3 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-brand-mint rounded" />
            <span className="text-body text-text-secondary text-sm">Remember me</span>
          </label>
          <a href="#" className="text-body text-text-primary text-sm hover:text-brand-mint transition-colors">Forgot password?</a>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-text-primary text-canvas-black rounded-button py-3 mt-4 font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Login to Dashboard
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-surface-border"></div>
          <span className="shrink-0 px-4 text-mono text-text-muted text-xs">OR CONTINUE WITH</span>
          <div className="flex-grow border-t border-surface-border"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="flex items-center justify-center gap-2 bg-surface-elevated border border-surface-border rounded-lg py-2.5 hover:bg-surface-slate transition-colors text-body text-text-primary text-sm">
            Google
          </button>
          <button type="button" className="flex items-center justify-center gap-2 bg-surface-elevated border border-surface-border rounded-lg py-2.5 hover:bg-surface-slate transition-colors text-body text-text-primary text-sm">
            GitHub
          </button>
        </div>
      </form>
    </motion.div>
  );
};