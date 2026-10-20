import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup' | 'forgot';
  onOpenSetupGuide?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  onOpenSetupGuide
}) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot'>(defaultTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await authService.signIn(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed');
        } else {
          setSuccessMessage('Successfully signed in!');
          setTimeout(() => {
            onClose();
          }, 600);
        }
      } else if (tab === 'signup') {
        const res = await authService.signUp(name, email, password);
        if (!res.success) {
          setError(res.error || 'Sign up failed');
        } else {
          setSuccessMessage(res.message || 'Account created successfully!');
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else if (tab === 'forgot') {
        const res = await authService.resetPassword(email);
        if (!res.success) {
          setError(res.error || 'Password reset request failed');
        } else {
          setSuccessMessage(res.message || 'Reset link dispatched!');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.signInWithGoogle();
      if (!res.success) {
        setError(res.error || 'Google sign-in error');
      } else {
        setSuccessMessage(res.message || 'Google sign-in successful!');
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (index: 0 | 1) => {
    authService.switchDemoAccount(index);
    setSuccessMessage(`Logged in as ${index === 0 ? 'Alex Morgan (ML Engineer)' : 'Sarah Chen (Full Stack)'}`);
    setTimeout(() => onClose(), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {tab === 'login' && 'Welcome Back to ResumeAI'}
            {tab === 'signup' && 'Create Your Candidate Account'}
            {tab === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tab === 'login' && 'Log in to access your resumes, recommendation matches, and tracker.'}
            {tab === 'signup' && 'Sign up to start intelligent job ranking and agent career assistance.'}
            {tab === 'forgot' && 'Enter your registered email to receive a secure recovery link.'}
          </p>
        </div>

        {/* Tab switch */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-xl mb-5 text-sm font-medium">
            <button
              onClick={() => { setTab('login'); setError(null); setSuccessMessage(null); }}
              className={`py-2 rounded-lg transition ${
                tab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError(null); setSuccessMessage(null); }}
              className={`py-2 rounded-lg transition ${
                tab === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Feedback notices */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setError(null); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
            {tab === 'login' && 'Sign In'}
            {tab === 'signup' && 'Create Account'}
            {tab === 'forgot' && 'Send Reset Link'}
          </button>
        </form>

        {/* OAuth Separator */}
        {tab !== 'forgot' && (
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative px-3 bg-slate-900 text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Or continue with
            </span>
          </div>
        )}

        {/* Google OAuth Button */}
        {tab !== 'forgot' && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-3 transition hover:border-slate-600"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        )}

        {/* Demo Fast Access Section */}
        <div className="mt-5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" /> Instant Test Evaluation
            </span>
            {onOpenSetupGuide && (
              <button
                onClick={() => { onClose(); onOpenSetupGuide(); }}
                className="text-xs text-indigo-400 hover:underline"
              >
                Setup Guide
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo(0)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-left transition"
            >
              <div className="font-semibold text-white">Alex Morgan</div>
              <div className="text-[10px] text-slate-400">ML Engineer Candidate</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo(1)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-left transition"
            >
              <div className="font-semibold text-white">Sarah Chen</div>
              <div className="text-[10px] text-slate-400">Full Stack Candidate</div>
            </button>
          </div>
        </div>

        {tab === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
