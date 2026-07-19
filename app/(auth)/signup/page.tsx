'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/components/auth-provider';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Registration form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name,
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to register.');
      } else if (data?.requireEmailVerification) {
        setShowVerification(true);
      } else if (data?.accessToken) {
        // Verification not required or auto logged-in
        await refreshUser();
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired verification code.');
      } else if (data?.accessToken) {
        await refreshUser();
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus(null);
    try {
      const { data, error } = await insforge.auth.resendVerificationEmail({
        email,
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to resend verification email.');
      } else {
        setResendStatus('Verification code resent successfully!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
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

        <h2 className="text-xl font-bold mb-6 text-zinc-100">
          {showVerification ? 'Verify Your Email' : 'Create Account'}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 text-red-400 text-sm rounded-md">
            {errorMsg}
          </div>
        )}

        {resendStatus && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-sm rounded-md">
            {resendStatus}
          </div>
        )}

        {!showVerification ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-50 focus:outline-none focus:border-lime-400 transition-colors"
                placeholder="John Doe"
              />
            </div>

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
                Password (min 6 chars)
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <p className="text-sm text-zinc-300 mb-4">
              We sent a 6-digit verification code to <span className="font-bold text-zinc-100">{email}</span>. Please enter it below.
            </p>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="otp">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-widest text-2xl font-bold px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-50 focus:outline-none focus:border-lime-400 transition-colors"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-lime-400 text-zinc-950 font-extrabold uppercase tracking-wider rounded-md hover:bg-lime-300 active:bg-lime-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(163,230,53,0.15)] focus:outline-none"
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-sm text-lime-400 hover:underline hover:text-lime-300"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-lime-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
