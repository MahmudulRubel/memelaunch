'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SafeImage } from '@/components/safe-image';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/components/auth-provider';
import { Loader2, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, refreshUser } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const otpParam = searchParams.get('otp') || searchParams.get('token') || '';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (otpParam) setOtp(otpParam);
  }, [emailParam, otpParam]);

  // Auto-trigger verification if email and otp parameters are passed in URL
  useEffect(() => {
    if (emailParam && otpParam && !successMsg && !isLoading) {
      handleVerify(emailParam, otpParam);
    }
  }, [emailParam, otpParam]);

  // Redirect to homepage if user is already authenticated and verified
  useEffect(() => {
    if (!authLoading && user?.emailVerified) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleVerify = async (verifyEmailAddr: string, verifyOtp: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email: verifyEmailAddr,
        otp: verifyOtp,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired verification code.');
      } else {
        setSuccessMsg('Email verified successfully! Redirecting...');
        await refreshUser();
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      setErrorMsg('Please enter both email and verification code.');
      return;
    }
    handleVerify(email, otp);
  };

  const handleResendCode = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address to resend the code.');
      return;
    }
    setResendStatus(null);
    setErrorMsg(null);
    try {
      const { error } = await insforge.auth.resendVerificationEmail({ email });
      if (error) {
        setErrorMsg(error.message || 'Failed to resend verification email.');
      } else {
        setResendStatus('Verification code sent! Check your inbox.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while resending code.');
    }
  };

  const isFormDisabled = isLoading || authLoading;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="text-center mb-6 flex flex-col items-center">
          <Link href="/" className="inline-block group hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
            <SafeImage 
              src="/logo.png" 
              fallbackType="logo"
              alt="Launchme MemeLaunch Logo" 
              width={192}
              height={48}
              className="h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              priority
            />
          </Link>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400/10 border border-lime-400/30 text-lime-400 rounded-full text-xs font-mono font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Security & Authentication
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2 text-zinc-100 text-center">Verify Your Email</h2>
        <p className="text-zinc-400 text-sm text-center mb-6">
          Enter your 6-digit confirmation code below to complete your account setup.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/40 text-red-400 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {resendStatus && (
          <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-sm rounded-xl flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{resendStatus}</span>
          </div>
        )}

        {successMsg ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-lime-400 animate-bounce" />
            <h3 className="text-lg font-bold text-zinc-100">{successMsg}</h3>
            <p className="text-xs font-mono text-zinc-400">Taking you to MemeLaunch...</p>
          </div>
        ) : (
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
              <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="otp">
                6-Digit Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                disabled={isFormDisabled}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-widest text-2xl font-bold px-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-50 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20 disabled:opacity-50 transition-all"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={isFormDisabled}
              className="w-full py-2.5 bg-lime-400 text-zinc-950 font-extrabold uppercase tracking-wider rounded-xl hover:bg-lime-300 active:bg-lime-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(163,230,53,0.15)] focus:outline-none cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  Verifying Code...
                </>
              ) : (
                'Verify Email & Proceed'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isFormDisabled}
                className="text-sm text-lime-400 hover:underline hover:text-lime-300 cursor-pointer disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-zinc-400">
          Already verified?{' '}
          <Link href="/login" className="text-lime-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-zinc-50">
          <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
          <p className="text-zinc-400 mt-2 text-sm font-mono">Loading email verification...</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
