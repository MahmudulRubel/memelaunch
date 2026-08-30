'use client';

import React, { useState } from 'react';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/components/auth-provider';
import { X, Sparkles, AlertCircle, Loader2, ArrowRight, CheckCircle2, Lock, Mail, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user?: any) => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Create an Account to Launch',
  subtitle = 'Join Memelaunch to submit your product, compete on the leaderboard, and earn launch points.',
}: AuthModalProps) {
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP verification state
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState('');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setOtp('');
    setShowVerification(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await insforge.auth.signUp({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      if (error) {
        // If user is already registered, automatically attempt log in
        const errorLower = (error.message || '').toLowerCase();
        const isExistingUser = 
          errorLower.includes('already') || 
          errorLower.includes('exists') || 
          errorLower.includes('registered') ||
          errorLower.includes('duplicate') ||
          errorLower.includes('taken') ||
          errorLower.includes('constraint') ||
          errorLower.includes('conflict');

        if (isExistingUser) {
          const { data: loginData, error: loginError } = await insforge.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (!loginError && loginData?.user) {
            await refreshUser();
            const userRes = await insforge.auth.getCurrentUser();
            const currentUser = userRes.data?.user || loginData.user;
            if (currentUser && onSuccess) {
              await onSuccess(currentUser);
            }
            handleClose();
            return;
          }

          // If auto-login fails (e.g. wrong password for existing account), switch to login tab
          setMode('login');
          setErrorMsg('An account with this email already exists. Please enter your password to sign in and launch your product.');
          return;
        }

        setErrorMsg(error.message || 'Failed to register.');
      } else if (data?.requireEmailVerification) {
        setShowVerification(true);
        setSuccessMsg('Verification code sent to your email.');
      } else {
        // Ensure session is set if not auto-returned
        if (!data?.accessToken) {
          await insforge.auth.signInWithPassword({ email: email.trim(), password }).catch(() => {});
        }

        fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toEmail: email.trim(), userName: name.trim() }),
        }).catch(() => {});

        await refreshUser();
        const userRes = await insforge.auth.getCurrentUser();
        const currentUser = userRes.data?.user || data?.user;
        if (currentUser && onSuccess) {
          await onSuccess(currentUser);
        }
        handleClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      } else {
        await refreshUser();
        const userRes = await insforge.auth.getCurrentUser();
        const currentUser = userRes.data?.user || data?.user;
        if (currentUser && onSuccess) {
          await onSuccess(currentUser);
        }
        handleClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email: email.trim(),
        otp: otp.trim(),
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired verification code.');
      } else {
        fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toEmail: email.trim(), userName: name.trim() }),
        }).catch(() => {});
        await refreshUser();
        const userRes = await insforge.auth.getCurrentUser();
        const currentUser = userRes.data?.user || data?.user;
        if (currentUser && onSuccess) {
          await onSuccess(currentUser);
        }
        handleClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingLaunchAfterAuth', 'true');
      }
      const { error } = await insforge.auth.signInWithOAuth(provider, {
        redirectTo: window.location.origin + '/launch',
      });
      if (error) {
        setErrorMsg(error.message || `Failed to sign in with ${provider}.`);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-lime-400/10 text-lime-400 border border-lime-400/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
        </div>

        {/* Mode Toggle Tabs */}
        {!showVerification && (
          <>
            {/* OAuth Social Login Options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn('google')}
                className="flex items-center justify-center py-2.5 px-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer group"
              >
                <svg className="h-4 w-4 fill-current mr-2 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn('github')}
                className="flex items-center justify-center py-2.5 px-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer group"
              >
                <svg className="h-4 w-4 fill-current mr-2 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-zinc-800/80 w-full" />
              <span className="absolute bg-zinc-950 px-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Or with email
              </span>
            </div>

            <div className="grid grid-cols-2 p-1 mb-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg transition ${
                  mode === 'signup'
                    ? 'bg-lime-400 text-black shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg transition ${
                  mode === 'login'
                    ? 'bg-lime-400 text-black shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Log In
              </button>
            </div>
          </>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-600/50 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-lime-950/60 border border-lime-500/50 rounded-xl flex items-center gap-2 text-lime-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {showVerification ? (
          /* OTP Verification Form */
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-zinc-300">Enter the 6-digit code sent to:</p>
              <p className="text-xs font-mono text-lime-400">{email}</p>
            </div>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full text-center text-xl tracking-widest py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
            </button>
          </form>
        ) : mode === 'signup' ? (
          /* Sign Up Form */
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Alex Rivers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-lime-400/10 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Launch</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Log In Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-lime-400/10 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Log In & Launch</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
