import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { AnimatePresence } from 'framer-motion';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(modeParam !== 'signup');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLogin(modeParam !== 'signup');
    }, 0);
    return () => clearTimeout(timer);
  }, [modeParam]);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center w-full">
        {/* Toggle between Login and Signup */}
        <div className="bg-canvas-black border border-surface-border rounded-full p-1 mb-8 inline-flex relative w-full max-w-[240px]">
           <div 
             className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface-elevated rounded-full transition-transform duration-300 shadow-sm border border-surface-border"
             style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)', left: '4px' }}
           ></div>
           <button 
             className={`flex-1 py-1.5 text-sm font-grotesk z-10 transition-colors ${isLogin ? 'text-text-primary' : 'text-text-secondary'}`}
             onClick={() => setIsLogin(true)}
           >
             Login
           </button>
           <button 
             className={`flex-1 py-1.5 text-sm font-grotesk z-10 transition-colors ${!isLogin ? 'text-text-primary' : 'text-text-secondary'}`}
             onClick={() => setIsLogin(false)}
           >
             Sign Up
           </button>
        </div>

        <div className="w-full relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <LoginForm key="login" />
            ) : (
              <SignupForm key="signup" />
            )}
          </AnimatePresence>
        </div>
        
        <p className="text-body text-text-muted text-sm mt-8 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            className="text-text-primary hover:text-brand-mint transition-colors ml-2 font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};