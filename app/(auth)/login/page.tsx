'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/components/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redirect to homepage if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
      router.refresh();
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      } else if (data?.accessToken) {
        // Refresh the session in context
        await refreshUser();
        // Redirect to homepage
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'x') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await insforge.auth.signInWithOAuth(provider, {
        redirectTo: window.location.origin + '/login',
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

  const isFormDisabled = isLoading || authLoading;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold uppercase tracking-tight text-lime-400 hover:text-lime-300 transition-colors">
            MemeLaunch
          </Link>
          <p className="text-zinc-400 mt-2 text-sm">
            Where SaaS meets shitposting. Stop building in silence.
          </p>
        </div>

        <h2 className="text-xl font-bold mb-6 text-zinc-100">Sign In</h2>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            disabled={isFormDisabled}
            onClick={() => handleOAuthSignIn('github')}
            className="flex items-center justify-center py-2.5 px-4 bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 active:bg-zinc-950 text-zinc-200 hover:text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <svg className="h-5 w-5 fill-current mr-2 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </button>
          <button
            type="button"
            disabled={isFormDisabled}
            onClick={() => handleOAuthSignIn('x')}
            className="flex items-center justify-center py-2.5 px-4 bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 active:bg-zinc-950 text-zinc-200 hover:text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <svg className="h-4 w-4 fill-current mr-2 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X / Twitter
          </button>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-zinc-800/80 w-full"></div>
          <span className="absolute bg-zinc-900 px-3 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
            Or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={isFormDisabled}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-50 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20 disabled:opacity-50 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={isFormDisabled}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-50 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20 disabled:opacity-50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isFormDisabled}
            className="w-full py-2.5 bg-lime-400 text-zinc-950 font-extrabold uppercase tracking-wider rounded-xl hover:bg-lime-300 active:bg-lime-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(163,230,53,0.15)] focus:outline-none cursor-pointer mt-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-lime-400 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
