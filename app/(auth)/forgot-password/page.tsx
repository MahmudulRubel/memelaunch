'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/components/auth-provider';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect to homepage if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({
        email,
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to send password reset email.');
      } else {
        setSuccessMsg('Reset code sent! Redirecting to reset page...');
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
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
            Forget your password? Let's get you back to the grind.
          </p>
        </div>

        <h2 className="text-xl font-bold mb-6 text-zinc-100">Reset Password</h2>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-sm rounded-xl">
            {successMsg}
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
              disabled={isFormDisabled}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-50 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20 disabled:opacity-50 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isFormDisabled}
            className="w-full py-2.5 bg-lime-400 text-zinc-950 font-extrabold uppercase tracking-wider rounded-xl hover:bg-lime-300 active:bg-lime-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(163,230,53,0.15)] focus:outline-none cursor-pointer mt-2"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Remembered your password?{' '}
          <Link href="/login" className="text-lime-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
