'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/components/auth-provider';
import { Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Set email from query parameter if present
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

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

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      if (tokenParam) {
        // Link-based password reset flow: use token directly
        const { error } = await insforge.auth.resetPassword({
          newPassword,
          otp: tokenParam,
        });

        if (error) {
          setErrorMsg(error.message || 'Failed to reset password.');
        } else {
          setSuccessMsg('Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } else {
        // Code-based password reset flow: exchange code first
        if (!code || code.length !== 6) {
          setErrorMsg('Please enter a valid 6-digit code.');
          setIsLoading(false);
          return;
        }

        const { data, error: exchangeError } = await insforge.auth.exchangeResetPasswordToken({
          email,
          code,
        });

        if (exchangeError || !data?.token) {
          setErrorMsg(exchangeError?.message || 'Invalid or expired reset code.');
          setIsLoading(false);
          return;
        }

        const { error: resetError } = await insforge.auth.resetPassword({
          newPassword,
          otp: data.token,
        });

        if (resetError) {
          setErrorMsg(resetError.message || 'Failed to reset password.');
        } else {
          setSuccessMsg('Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
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
            Set your new password and get back to meme-ing.
          </p>
        </div>

        <h2 className="text-xl font-bold mb-6 text-zinc-100">Set New Password</h2>

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
          {!tokenParam && (
            <>
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
                <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="code">
                  6-Digit Reset Code
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  maxLength={6}
                  disabled={isFormDisabled}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-center tracking-widest text-xl font-bold px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-50 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20 disabled:opacity-50 transition-all"
                  placeholder="123456"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="newPassword">
              New Password (min 6 chars)
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              disabled={isFormDisabled}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-50 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20 disabled:opacity-50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              disabled={isFormDisabled}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-50 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20 disabled:opacity-50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isFormDisabled}
            className="w-full py-2.5 bg-lime-400 text-zinc-950 font-extrabold uppercase tracking-wider rounded-xl hover:bg-lime-300 active:bg-lime-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(163,230,53,0.15)] focus:outline-none cursor-pointer mt-2"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-zinc-50">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
        <p className="text-zinc-400 mt-2 text-sm font-mono">Loading reset session...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
