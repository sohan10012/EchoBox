import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  const isRegisterRoute = location.pathname === '/register';
  const [isRegister, setIsRegister] = useState(isRegisterRoute);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync route changes
  useEffect(() => {
    setIsRegister(location.pathname === '/register');
    setErrorMessage(null);
  }, [location.pathname]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const target = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long for Cognito security.');
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your confirmation password.');
        return;
      }
    }

    try {
      setIsLoading(true);
      if (isRegister) {
        await register(cleanEmail, password, name.trim());
      } else {
        await login(cleanEmail, password);
      }
      const target = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85dvh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-brand-500/10 blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AWS Cognito Authenticated</span>
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            {isRegister ? 'Create Owner Account' : 'Welcome to EchoBox'}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isRegister
              ? 'Create your private owner workspace to launch anonymous feedback spaces.'
              : 'Sign in to access your spaces, feedback streams, and conversation rooms.'}
          </p>
        </div>

        {/* Auth Card with Glassmorphism */}
        <div className="rounded-2xl border border-white/10 bg-[#121614]/85 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Notice for anonymous visitors */}
          <div className="p-3.5 rounded-xl bg-[#00D99A]/10 border border-[#00D99A]/20 text-xs text-neutral-200 leading-relaxed">
            <strong className="font-semibold text-[#00D99A]">Joining an anonymous room?</strong> Visitors do not need an account or sign-up. If someone shared an EchoBox link with you, navigate directly to that room URL to start chatting.
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/5">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMessage(null);
                window.history.replaceState(null, '', '/login');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white/10 text-white shadow-sm border border-white/10'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMessage(null);
                window.history.replaceState(null, '', '/register');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isRegister
                  ? 'bg-white/10 text-white shadow-sm border border-white/10'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-fade-in">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5 animate-fade-in">
                <label
                  htmlFor="user-name"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Full Name / Display Name <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="user-email"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourdomain.com"
                  autoComplete="email"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="user-password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <span className="text-[11px] text-neutral-400">Min 8 characters</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-1.5 animate-fade-in">
                <label
                  htmlFor="user-confirm-password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="user-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 font-semibold shadow-glow"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              {isRegister ? 'Create Account' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* Footer note */}
          <div className="pt-2 text-center">
            <span className="text-xs text-neutral-400">
              {isRegister ? 'Already have an owner account? ' : "Don't have an owner account yet? "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage(null);
                  window.history.replaceState(null, '', isRegister ? '/login' : '/register');
                }}
                className="text-brand-500 hover:text-brand-400 font-semibold underline underline-offset-4"
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
