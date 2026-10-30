import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const isRegisterInitial = location.pathname === '/register';
  const [isRegister, setIsRegister] = useState(isRegisterInitial);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillDemoCredentials = () => {
    setEmail('founder@echobox.dev');
    setPassword('echobox2026!');
    setName('Alex Rivera');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      if (isRegister) {
        await register(cleanEmail, password, name.trim());
      } else {
        await login(cleanEmail, password);
      }
      navigate('/dashboard');
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-brand-500/10 blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-brand-500" />
            <span>EchoBox Security Boundary</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            {isRegister ? 'Create Owner Account' : 'Welcome to EchoBox'}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isRegister
              ? 'Start creating anonymous feedback rooms and gathering genuine team thoughts.'
              : 'Sign in to access and manage your private feedback spaces.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#121212]/95 backdrop-blur-md p-6 sm:p-8 shadow-card-light dark:shadow-card-dark space-y-6">
          {/* Notice for anonymous visitors */}
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
            <strong>Joining a room?</strong> Anonymous visitors do not need an account. If someone sent you an EchoBox room link, simply navigate directly to that URL to start chatting.
          </div>
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200/60 dark:border-white/5">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegister
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Register
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
                  Full Name / Display Name
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
                  placeholder="you@domain.com"
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
                <span className="text-[11px] text-neutral-400">Min 6 characters</span>
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
                  placeholder="••••••••"
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

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 font-semibold"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Demo Helper Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-neutral-300 dark:border-white/15 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Fill Demo Credentials (One Click)</span>
            </button>
          </div>

          {/* Architectural Separation Notice */}
          <div className="pt-4 border-t border-neutral-100 dark:border-white/5 space-y-2">
            <div className="flex items-start gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-200/50 dark:border-white/5">
              <Shield className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-neutral-800 dark:text-neutral-200">Architecture Ready:</strong> Authenticated sessions interface through a pluggable service abstraction. When AWS Cognito is configured, swap to the Cognito adapter with zero UI alterations.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
