import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const calculateStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length > 5) s += 25;
    if (pwd.length > 8) s += 25;
    if (/[A-Z]/.test(pwd)) s += 25;
    if (/[0-9]/.test(pwd)) s += 25;
    return s;
  };

  const strength = calculateStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strength < 50) {
      setError('Password is too weak');
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
      <h2 className="text-heading-lg text-text-primary mb-2 text-2xl">Create Account</h2>
      <p className="text-body text-text-secondary mb-8">Join GramDrishti to start monitoring.</p>

      {error && (
        <div className="mb-4 p-3 bg-semantic-danger/10 border border-semantic-danger/30 text-semantic-danger rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">FULL NAME</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-2.5 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">EMAIL</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-2.5 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">PASSWORD</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-2.5 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="••••••••"
          />
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-2 flex gap-1 h-1 w-full">
              <div className={`h-full flex-1 rounded-full ${strength > 0 ? 'bg-semantic-danger' : 'bg-surface-border'}`}></div>
              <div className={`h-full flex-1 rounded-full ${strength >= 50 ? 'bg-semantic-warning' : 'bg-surface-border'}`}></div>
              <div className={`h-full flex-1 rounded-full ${strength >= 75 ? 'bg-score-good' : 'bg-surface-border'}`}></div>
              <div className={`h-full flex-1 rounded-full ${strength >= 100 ? 'bg-score-excellent' : 'bg-surface-border'}`}></div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-mono text-text-secondary text-xs mb-1.5">CONFIRM PASSWORD</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-canvas-black border border-surface-border rounded-lg px-4 py-2.5 text-body text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-text-primary text-canvas-black rounded-button py-3 mt-4 font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Create Account
        </button>
      </form>
    </motion.div>
  );
};