'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/components/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold uppercase tracking-tight text-lime-400 hover:text-lime-300 transition-colors">
            MemeLaunch
          </Link>
          <p className="text-zinc-400 mt-2 text-sm">
            Fun hooks, serious technical details underneath.
          </p>
        </div>

        <h2 className="text-xl font-bold mb-6 text-zinc-100">Sign In</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 text-red-400 text-sm rounded-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-50 focus:outline-none focus:border-lime-400 transition-colors"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-50 focus:outline-none focus:border-lime-400 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-lime-400 text-zinc-950 font-extrabold uppercase tracking-wider rounded-md hover:bg-lime-300 active:bg-lime-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(163,230,53,0.15)] focus:outline-none"
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
