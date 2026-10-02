'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { getUserPoints } from '@/lib/points';
import { EarnPointsModal } from '@/components/points/earn-points-modal';
import { LaunchBoostModal } from '@/components/points/launch-boost-modal';
import { EmbedBadgeModal } from '@/components/points/embed-badge-modal';
import { AuthModal } from '@/components/auth/auth-modal';
import { MemePicker3, type MemePickerItem } from '@/components/launch/meme-picker-3';
import { InDepthDossierPreview } from '@/components/launch/in-depth-dossier-preview';
import { generateMemeSvgComposite } from '@/lib/meme-compositor';
import {
  VALID_CATEGORIES,
  type InstantLaunchMeme,
  type InstantLaunchResult,
} from '@/lib/instant-launch';
import { type SeoDossier, synthesizeSeoDossier } from '@/lib/seo-dossier';
import {
  Globe,
  Sparkles,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
  Upload,
  Flame,
  Check,
  Zap,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Crown,
} from 'lucide-react';

const SESSION_STORAGE_KEY = 'memelaunch_instant_launch_draft';
const PENDING_AUTH_KEY = 'memelaunch_pending_launch_after_auth';

export default function LaunchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
          <p className="text-zinc-400 font-mono text-sm">Loading launch environment...</p>
        </div>
      }
    >
      <LaunchPageContent />
    </Suspense>
  );
}

function LaunchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams ? searchParams.get('url') || searchParams.get('productUrl') : null;
  const { user, isLoading: authLoading } = useAuth();

  // Wizard Step: 'input' | 'generating' | 'review'
  const [step, setStep] = useState<'input' | 'generating' | 'review'>('input');

  // Hero URL Input
  const [heroUrl, setHeroUrl] = useState('');
  const [generationProgress, setGenerationProgress] = useState<number>(1);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Review & Edit State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<string>('SaaS');
  const [pricing, setPricing] = useState<'free' | 'freemium' | 'paid'>('freemium');
  const [productUrl, setProductUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productLogoUrl, setProductLogoUrl] = useState('');
  const [seoDossier, setSeoDossier] = useState<SeoDossier | null>(null);
  const [memes, setMemes] = useState<MemePickerItem[]>([]);
  const [selectedMemeIdx, setSelectedMemeIdx] = useState<number>(0);
  const [isRegeneratingMemes, setIsRegeneratingMemes] = useState(false);

  // Submission & Post-Launch Modals
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAiApproved, setIsAiApproved] = useState<boolean | null>(null);
  const [aiEvaluationData, setAiEvaluationData] = useState<{
    isApproved?: boolean;
    score?: number;
    reason?: string;
    feedback?: string;
  } | null>(null);
  const [createdLaunchData, setCreatedLaunchData] = useState<{
    id?: string;
    product_name?: string;
    product_url?: string;
    meme_image_url?: string;
  } | null>(null);

  // Launch Tiers & Embed Badge Modal State
  const [selectedLaunchTier, setSelectedLaunchTier] = useState<'free' | 'badge' | 'paid'>('badge');
  const [isEmbedBadgeModalOpen, setIsEmbedBadgeModalOpen] = useState(false);
  const [badgeVerifiedUrl, setBadgeVerifiedUrl] = useState<string | null>(null);

  // Points & Auth Modals
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isEarnPointsModalOpen, setIsEarnPointsModalOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Hidden file input refs
  const customMemeInputRef = useRef<HTMLInputElement>(null);
  const customLogoInputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredUrlParam = useRef(false);

  // Fetch user points on mount
  useEffect(() => {
    if (!user) return;
    async function checkPoints() {
      try {
        const pts = await getUserPoints(user!.id);
        setUserPoints(pts);
      } catch (e) {
        console.warn('Failed to load user points:', e);
      }
    }
    checkPoints();
  }, [user]);

  // Restore draft state from sessionStorage on mount (if no explicit urlParam)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved && !urlParam) {
        const parsed = JSON.parse(saved);
        if (parsed.productName && parsed.productUrl && Array.isArray(parsed.memes) && parsed.memes.length > 0) {
          setProductName(parsed.productName);
          setCategory(parsed.category || 'SaaS');
          setPricing(parsed.pricing || 'freemium');
          setProductUrl(parsed.productUrl);
          setHeroUrl(parsed.productUrl);
          setProductDescription(parsed.productDescription || '');
          setProductLogoUrl(parsed.productLogoUrl || '');
          setSeoDossier(parsed.seoDossier || null);
          setMemes(parsed.memes);
          setSelectedMemeIdx(parsed.selectedMemeIdx || 0);
          setStep('review');
        }
      }
    } catch (e) {
      console.warn('Draft restoration warning:', e);
    }
  }, [urlParam]);

  // Automatically sync draft state to sessionStorage during review
  useEffect(() => {
    if (typeof window === 'undefined' || step !== 'review') return;
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          productName,
          category,
          pricing,
          productUrl,
          productDescription,
          productLogoUrl,
          seoDossier,
          memes,
          selectedMemeIdx,
        })
      );
    } catch (e) {}
  }, [
    step,
    productName,
    category,
    pricing,
    productUrl,
    productDescription,
    productLogoUrl,
    seoDossier,
    memes,
    selectedMemeIdx,
  ]);

  // Auto-trigger generation if urlParam exists on mount
  useEffect(() => {
    if (urlParam && !hasTriggeredUrlParam.current) {
      hasTriggeredUrlParam.current = true;
      let target = urlParam.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = `https://${target}`;
      }
      setHeroUrl(target);
      handleGenerate(target);
    }
  }, [urlParam]);

  // Resume submission after auth login
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    const isPending = sessionStorage.getItem(PENDING_AUTH_KEY);
    if (isPending === 'true') {
      sessionStorage.removeItem(PENDING_AUTH_KEY);
      if (productName && productUrl && category) {
        executeSubmission(user);
      }
    }
  }, [user, productName, productUrl, category]);

  /**
   * Main Generation Handler: Calls /api/ai/instant-launch
   */
  const handleGenerate = async (urlInput?: string) => {
    const rawUrl = (urlInput || heroUrl).trim();
    if (!rawUrl) {
      setGenerationError('Please enter your product website URL.');
      return;
    }

    let validUrl = rawUrl;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    setHeroUrl(validUrl);
    setGenerationError(null);
    setStep('generating');
    setIsGenerating(true);
    setGenerationProgress(1);

    // Timed simulated steps for smooth UX
    const t1 = setTimeout(() => setGenerationProgress(2), 2400);
    const t2 = setTimeout(() => setGenerationProgress(3), 8500);

    try {
      const res = await fetch('/api/ai/instant-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validUrl }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to generate instant launch details.');
      }

      const data: InstantLaunchResult = json.data;

      // Populate review state
      setProductName(data.productName || 'My Product');
      setCategory(VALID_CATEGORIES.includes(data.category as any) ? data.category : 'SaaS');
      setPricing(data.pricing || 'freemium');
      setProductUrl(data.productUrl || validUrl);
      setProductDescription(data.productDescription || '');
      setProductLogoUrl(data.productLogoUrl || '');
      setSeoDossier(
        data.seoDossier ||
          synthesizeSeoDossier({
            product_name: data.productName,
            product_description: data.productDescription,
            category: data.category,
            pricing: data.pricing,
            product_url: data.productUrl,
          })
      );
      setMemes(data.memes || []);
      setSelectedMemeIdx(0);

      // Advance to review step
      setStep('review');
    } catch (err: any) {
      console.error('Instant launch error:', err);
      setGenerationError(
        err.message || 'Unable to analyze website. Please check the URL and try again.'
      );
      setStep('input');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsGenerating(false);
    }
  };

  /**
   * Regenerates memes for the current product
   */
  const handleRegenerateMemes = async () => {
    const urlToUse = productUrl || heroUrl;
    if (!urlToUse) return;

    setIsRegeneratingMemes(true);
    try {
      const res = await fetch('/api/ai/instant-launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToUse }),
      });

      const json = await res.json();
      if (json.success && json.data?.memes?.length > 0) {
        setMemes(json.data.memes);
        setSelectedMemeIdx(0);
      }
    } catch (err) {
      console.warn('Failed to regenerate memes:', err);
    } finally {
      setIsRegeneratingMemes(false);
    }
  };

  /**
   * Custom Meme Upload
   */
  const handleCustomMemeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const customItem: MemePickerItem = {
        id: `custom-meme-${Date.now()}`,
        angle: 'Custom Upload',
        topText: '',
        bottomText: '',
        caption: file.name.replace(/\.[^/.]+$/, ''),
        url: dataUrl,
        baseImageUrl: dataUrl,
        prompt: 'User uploaded custom meme',
      };
      setMemes((prev) => [customItem, ...prev]);
      setSelectedMemeIdx(0);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Custom Logo Upload
   */
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProductLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Submission Gatekeeper
   */
  const handleConfirmAndLaunch = async (overrideTier?: 'free' | 'badge' | 'paid') => {
    setSubmitError(null);

    const activeTier = overrideTier || selectedLaunchTier;

    if (!productName.trim() || !productUrl.trim() || !category.trim()) {
      setSubmitError('Product name, category, and URL are required to launch.');
      return;
    }

    if (activeTier === 'badge' && !badgeVerifiedUrl) {
      // Need badge verification first
      setIsEmbedBadgeModalOpen(true);
      return;
    }

    if (!user) {
      try {
        sessionStorage.setItem(PENDING_AUTH_KEY, 'true');
      } catch {}
      setIsAuthModalOpen(true);
      return;
    }

    await executeSubmission(user, activeTier);
  };

  /**
   * Executes the actual launch submission to /api/launch/create
   */
  const executeSubmission = async (
    authUser: any,
    tierToUse: 'free' | 'badge' | 'paid' = selectedLaunchTier
  ) => {
    setIsSubmitting(true);
    setStatusMessage('Preparing your viral launch...');
    setSubmitError(null);

    try {
      const selectedMeme = memes[selectedMemeIdx] || memes[0];
      const baseImg = selectedMeme?.baseImageUrl || selectedMeme?.url || '';
      const finalMemeUrl = baseImg
        ? generateMemeSvgComposite({
            imageUrl: baseImg,
            topText: selectedMeme?.topText || '',
            bottomText: selectedMeme?.bottomText || '',
          })
        : selectedMeme?.url || '';

      const otherMemes = memes
        .filter((_, idx) => idx !== selectedMemeIdx)
        .map((m) => {
          const bImg = m.baseImageUrl || m.url;
          const compUrl = bImg
            ? generateMemeSvgComposite({
                imageUrl: bImg,
                topText: m.topText || '',
                bottomText: m.bottomText || '',
              })
            : m.url;
          return { url: compUrl, caption: m.caption, angle: m.angle };
        });

      const dossierToSave =
        seoDossier ||
        synthesizeSeoDossier({
          product_name: productName.trim(),
          product_description: productDescription.trim(),
          category: category.trim(),
          pricing,
          product_url: productUrl.trim(),
        });

      setStatusMessage(
        tierToUse === 'paid'
          ? '💳 Connecting to Whop Fast-Track Checkout...'
          : '🤖 Autonomous AI Reviewing & Verifying Product Quality...'
      );

      const response = await fetch('/api/launch/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authUser.id,
          memeImageUrl: finalMemeUrl,
          productName: productName.trim(),
          productUrl: productUrl.trim(),
          pricing,
          category: category.trim(),
          productDescription: productDescription.trim(),
          productLogoUrl: productLogoUrl || '',
          screenshotUrls: [],
          seoDossier: dossierToSave,
          alternateMemes: [],
          launchTier: tierToUse,
          isDofollow: tierToUse === 'badge' || tierToUse === 'paid',
          badgeVerified: tierToUse === 'badge' && Boolean(badgeVerifiedUrl),
          isPaid: false,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit launch. Please try again.');
      }

      // If Paid Tier, redirect user directly to Whop checkout URL
      if (tierToUse === 'paid' && result.whop_checkout_url) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(PENDING_AUTH_KEY);
          window.location.href = result.whop_checkout_url;
        }
        return;
      }

      // Clear draft session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(PENDING_AUTH_KEY);
      }

      // Update points balance
      try {
        const updatedPts = await getUserPoints(authUser.id);
        setUserPoints(updatedPts);
      } catch {}

      const createdLaunch = result.launch || {
        id: result.launchId,
        product_name: productName.trim(),
        product_url: productUrl.trim(),
        meme_image_url: selectedMeme?.url || '',
      };

      const approved = result.is_approved === true;
      const aiEval = result.ai_evaluation;

      setIsAiApproved(approved);
      setAiEvaluationData(aiEval || null);
      setCreatedLaunchData(createdLaunch);
      setStatusMessage('');

      if (approved) {
        setIsBoostModalOpen(true);
        setSuccessMessage(
          aiEval?.reason ||
            'Product passed automated AI review and is published live on the community feed!'
        );
      } else {
        setSuccessMessage(
          aiEval?.reason ||
            'Submission did not meet automated quality/safety guidelines and was saved as unapproved.'
        );
      }
    } catch (err: any) {
      console.error('Launch submission error:', err);
      setSubmitError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
      setStatusMessage('');
    }
  };

  const selectedMeme = memes[selectedMemeIdx] || memes[0];

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Loading launch environment...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto px-2 sm:px-4 pb-20">
      {/* Hidden file inputs */}
      <input
        ref={customMemeInputRef}
        type="file"
        accept="image/*"
        onChange={handleCustomMemeUpload}
        className="hidden"
      />
      <input
        ref={customLogoInputRef}
        type="file"
        accept="image/*"
        onChange={handleCustomLogoUpload}
        className="hidden"
      />

      {/* Success View */}
      {successMessage ? (
        <div
          className={`flex flex-col items-center justify-center p-8 sm:p-14 border rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-2xl ${
            isAiApproved ? 'bg-zinc-900/40 border-lime-400/30' : 'bg-zinc-900/50 border-amber-500/40'
          }`}
        >
          {isAiApproved ? (
            <div className="h-20 w-20 bg-lime-400/10 border-2 border-lime-400/40 rounded-full flex items-center justify-center text-lime-400 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          ) : (
            <div className="h-20 w-20 bg-amber-500/10 border-2 border-amber-500/40 rounded-full flex items-center justify-center text-amber-400">
              <AlertCircle className="h-10 w-10" />
            </div>
          )}

          <div className="space-y-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                isAiApproved
                  ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiApproved ? 'Autonomous AI Approved & Live' : 'AI Review: Revision Needed'}</span>
            </div>
            <h2 className="text-3xl font-black text-zinc-100 tracking-tight">
              {isAiApproved ? 'Launch Published Successfully! 🚀' : 'Submission Needs Revision'}
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed max-w-lg mx-auto">
              {successMessage}
            </p>
            {aiEvaluationData?.feedback && (
              <p className="text-zinc-400 text-xs font-mono bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-left max-w-md mx-auto">
                💡 <strong className="text-zinc-200">AI Feedback:</strong>{' '}
                {aiEvaluationData.feedback}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {isAiApproved ? (
              <>
                <Link
                  href={`/products/${encodeURIComponent(productName.trim())}`}
                  className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:scale-102 flex items-center gap-2"
                >
                  <span>View Product Live</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsBoostModalOpen(true)}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-lime-400 font-mono text-xs font-bold uppercase tracking-wider rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                >
                  Boost Upvotes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage('');
                  setIsAiApproved(null);
                  setAiEvaluationData(null);
                }}
                className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Edit Product & Resubmit
              </button>
            )}
          </div>
        </div>
      ) : step === 'input' || step === 'generating' ? (
        /* STEP 1: HERO URL INPUT & GENERATING CHECKLIST */
        <div className="max-w-3xl mx-auto space-y-8 pt-8 sm:pt-14 text-center">
          {/* Hero Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-mono font-bold tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              <span>ZERO-FRICTION INSTANT LAUNCH</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
              Launch In <span className="text-lime-400">Seconds</span>, Not Hours
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Enter your product URL. Our AI extracts your brand, synthesizes your in-depth SEO
              dossier, and crafts 3 viral memes ready for the feed.
            </p>
          </div>

          {/* Hero URL Input Form */}
          <div className="p-3 sm:p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerate();
              }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="relative flex-1 w-full">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="url"
                  required
                  disabled={isGenerating}
                  placeholder="https://yourproduct.com"
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl text-base text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-4 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black rounded-2xl text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(163,230,53,0.3)] hover:shadow-[0_0_35px_rgba(163,230,53,0.45)] hover:scale-102 active:scale-98 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Launch 🚀</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generation Error Alert */}
          {generationError && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-center justify-between text-rose-300 text-xs sm:text-sm shadow-xl text-left animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{generationError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 rounded-lg font-mono text-xs transition-colors shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Step 1 Animated Multi-Step Progress Checklist during Generation */}
          {step === 'generating' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-lime-500/30 shadow-[0_0_50px_rgba(163,230,53,0.1)] backdrop-blur-xl text-left space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-400"></span>
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Generating Launch Package...
                  </h3>
                </div>
                <span className="text-xs font-mono text-lime-400 font-bold bg-lime-400/10 px-2.5 py-1 rounded-full border border-lime-400/20">
                  Step {generationProgress} of 3
                </span>
              </div>

              {/* Multi-step progress list */}
              <div className="space-y-4">
                {/* 1. Website scraping */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    generationProgress > 1
                      ? 'bg-zinc-900/40 border-lime-500/30 text-zinc-300'
                      : generationProgress === 1
                      ? 'bg-lime-400/10 border-lime-400/40 text-lime-300 shadow-sm'
                      : 'bg-zinc-900/20 border-zinc-800/50 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {generationProgress > 1 ? (
                      <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-lime-400 animate-spin shrink-0" />
                    )}
                    <span className="text-sm font-semibold">
                      1. Reading website &amp; extracting brand assets...
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                    {generationProgress > 1 ? 'Extracted' : 'In Progress'}
                  </span>
                </div>

                {/* 2. AI reasoning & dossier */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    generationProgress > 2
                      ? 'bg-zinc-900/40 border-cyan-500/30 text-zinc-300'
                      : generationProgress === 2
                      ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-300 shadow-sm'
                      : 'bg-zinc-900/20 border-zinc-800/50 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {generationProgress > 2 ? (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                    ) : generationProgress === 2 ? (
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                        2
                      </div>
                    )}
                    <span className="text-sm font-semibold">
                      2. Synthesizing in-depth product dossier...
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                    {generationProgress > 2
                      ? 'Complete'
                      : generationProgress === 2
                      ? 'Reasoning'
                      : 'Pending'}
                  </span>
                </div>

                {/* 3. 3 Memes crafting */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    generationProgress === 3
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-sm'
                      : 'bg-zinc-900/20 border-zinc-800/50 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {generationProgress === 3 ? (
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                        3
                      </div>
                    )}
                    <span className="text-sm font-semibold">
                      3. Crafting 3 hilarious viral memes...
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                    {generationProgress === 3 ? 'Compositing' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: SIMPLIFIED LAUNCHPAD DASHBOARD */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Bar Navigation & Quick Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-mono font-bold">
                  Step 2 of 2
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                  Launchpad Dashboard
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Review your AI-generated meme and dossier below. Edit anything or launch immediately.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition-all self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Change Product URL</span>
            </button>
          </div>

          {/* TOP SECTION: 3-MEME SELECTOR */}
          <div className="rounded-3xl bg-zinc-900/30 border border-zinc-800/80 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
            <MemePicker3
              memes={memes}
              selectedMemeIdx={selectedMemeIdx}
              onSelect={setSelectedMemeIdx}
              onRegenerate={handleRegenerateMemes}
              isRegenerating={isRegeneratingMemes}
              onUploadCustomClick={() => customMemeInputRef.current?.click()}
              onMemeTextEdit={(index, field, value) => {
                setMemes((prev) =>
                  prev.map((m, i) => {
                    if (i !== index) return m;
                    const updated = { ...m, [field]: value };
                    const baseImg = updated.baseImageUrl || updated.url;
                    const newUrl = baseImg
                      ? generateMemeSvgComposite({
                          imageUrl: baseImg,
                          topText: field === 'topText' ? value : updated.topText || '',
                          bottomText: field === 'bottomText' ? value : updated.bottomText || '',
                        })
                      : updated.url;
                    return {
                      ...updated,
                      url: newUrl,
                    };
                  })
                );
              }}
            />

          </div>

          {/* 2-COLUMN LAYOUT BELOW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN (STICKY): LIVE FEED PREVIEW CARD (5 Cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400"></span>
                  </span>
                  Live Feed Preview
                </span>
                <span className="text-[10px] font-mono text-lime-400 bg-lime-400/10 border border-lime-400/30 px-2 py-0.5 rounded-full font-bold">
                  Card Appearance
                </span>
              </div>

              {/* Feed Card Mockup */}
              <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-zinc-700">
                {/* 1:1 Square Image Container */}
                <div className="relative aspect-square bg-zinc-900 overflow-hidden border-b border-zinc-800/80 group flex items-center justify-center">
                  {selectedMeme?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedMeme.baseImageUrl || selectedMeme.url}
                      alt={selectedMeme.caption || 'Product Meme'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950">
                      <Sparkles className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
                      <p className="text-xs font-mono text-zinc-500">Meme Preview</p>
                    </div>
                  )}

                  {/* Live Impact Overlay on Live Feed Preview */}
                  {Boolean(selectedMeme?.baseImageUrl) && selectedMeme?.topText && (
                    <div className="absolute top-2.5 inset-x-2 pointer-events-none text-center z-10">
                      <p
                        className="font-impact uppercase tracking-wider leading-tight text-white px-2 select-none"
                        style={{
                          fontSize: 'clamp(12px, 3.5vw, 18px)',
                          textShadow:
                            '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
                        }}
                      >
                        {selectedMeme.topText}
                      </p>
                    </div>
                  )}
                  {Boolean(selectedMeme?.baseImageUrl) && selectedMeme?.bottomText && (
                    <div className="absolute bottom-2.5 inset-x-2 pointer-events-none text-center z-10">
                      <p
                        className="font-impact uppercase tracking-wider leading-tight text-white px-2 select-none"
                        style={{
                          fontSize: 'clamp(12px, 3.5vw, 18px)',
                          textShadow:
                            '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
                        }}
                      >
                        {selectedMeme.bottomText}
                      </p>
                    </div>
                  )}

                  {/* Angle badge floating on meme */}
                  {selectedMeme?.angle && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 border border-zinc-700 backdrop-blur-md text-[10px] font-mono font-bold text-zinc-200 z-20">
                      {selectedMeme.angle}
                    </div>
                  )}
                </div>

                {/* Card Content Details */}
                <div className="p-5 space-y-4">
                  {/* Header Row: Logo, Name, Category & Price */}
                  <div className="flex items-start gap-3">
                    {productLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productLogoUrl}
                        alt="Product Logo"
                        className="h-10 w-10 rounded-xl object-cover border border-zinc-800 bg-zinc-900 shrink-0 shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl border border-dashed border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-600 font-mono text-[10px] uppercase font-bold shrink-0">
                        Logo
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-base text-zinc-100 truncate">
                          {productName || 'Product Name'}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase font-bold tracking-wider shrink-0 ${
                            pricing === 'free'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : pricing === 'freemium'
                              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                              : 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                          }`}
                        >
                          {pricing === 'free' ? 'Free' : pricing === 'freemium' ? 'Freemium' : 'Paid'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-mono">
                          <Tag className="h-3 w-3 text-lime-400" />
                          <span>{category || 'SaaS'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hook / Tagline */}
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed italic border-l-2 border-lime-400/50 pl-2.5">
                    &ldquo;{seoDossier?.tagline || productDescription || 'The modern standard for builders.'}&rdquo;
                  </p>

                  {/* Description Preview */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {productDescription}
                  </p>

                  {/* Product URL Link Mockup */}
                  {productUrl && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                      <span className="truncate max-w-[200px] text-zinc-500">{productUrl}</span>
                      <span className="text-lime-400 font-bold flex items-center gap-1">
                        Visit Site <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  )}

                  {/* Reaction Bar Mockup */}
                  <div className="flex items-center justify-between gap-2 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-1.5 pointer-events-none">
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-mono text-zinc-400 bg-zinc-950/40">
                      <span>🔥</span> <span className="font-bold text-zinc-300">0</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-mono text-zinc-400 bg-zinc-950/40">
                      <span>😂</span> <span className="font-bold text-zinc-300">0</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-mono text-zinc-400 bg-zinc-950/40">
                      <span>🚀</span> <span className="font-bold text-zinc-300">0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Message Overlay when submitting */}
              {isSubmitting && statusMessage && (
                <div className="p-4 bg-lime-950/30 border border-lime-500/30 rounded-2xl flex items-center gap-3 text-lime-400 text-sm font-mono shadow-xl animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-lime-400 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: QUICK PRODUCT EDIT & DOSSIER & LAUNCH CTA (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quick Details Edit Card */}
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-lime-400/10 border border-lime-400/30 text-lime-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-100">Quick Product Info</h3>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                    Pre-filled by AI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. MemeLaunch"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm focus:outline-none focus:border-lime-400 text-zinc-100 font-medium"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm focus:outline-none focus:border-lime-400 text-zinc-100 font-medium cursor-pointer appearance-none"
                      >
                        {VALID_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-zinc-950 text-zinc-100">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Selector Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Pricing Model
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'free', label: 'Free' },
                      { id: 'freemium', label: 'Freemium' },
                      { id: 'paid', label: 'Paid' },
                    ].map((item) => {
                      const isSelected = pricing === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPricing(item.id as any)}
                          className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-lime-400/15 border-lime-400 text-lime-300 shadow-[0_0_15px_rgba(163,230,53,0.15)]'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5 mr-1" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Elevator Pitch / Description
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {productDescription.length}/500 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Short punchy elevator pitch..."
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-lime-400 resize-none leading-relaxed"
                  />
                </div>

                {/* Logo Quick Preview & Replace */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center gap-3">
                    {productLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productLogoUrl}
                        alt="Logo"
                        className="w-8 h-8 rounded-lg object-cover border border-zinc-700 bg-zinc-900"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                        Logo
                      </div>
                    )}
                    <span className="text-xs font-mono text-zinc-400">Brand Logo</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => customLogoInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 border border-zinc-700/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Change Logo</span>
                  </button>
                </div>
              </div>

              {/* In-Depth SEO Dossier Component */}
              {seoDossier && (
                <InDepthDossierPreview
                  dossier={seoDossier}
                  productName={productName}
                  onChange={setSeoDossier}
                />
              )}

              {/* Submit Error Notification */}
              {submitError && (
                <div className="p-4 bg-rose-950/70 border border-rose-700 rounded-2xl flex items-center gap-3 text-rose-300 text-xs sm:text-sm shadow-xl animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* --- 3 LAUNCH OPTIONS TIERS GRID --- */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="text-center space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-lime-400" />
                    <span>Choose How You Want to Launch</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                    Launch free anytime, earn a permanent <strong className="text-lime-400">Dofollow</strong> backlink with our embed badge, or skip the badge with instant $4.99 fast-track.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* OPTION 1: Standard Free */}
                  <div
                    onClick={() => setSelectedLaunchTier('free')}
                    className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedLaunchTier === 'free'
                        ? 'bg-zinc-900 border-zinc-500 shadow-lg ring-2 ring-zinc-400/20'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Standard</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 font-bold">$0 Free</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Community Launch</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Standard queue submission for community voting.
                        </p>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>Community feed listing</span>
                        </li>
                        <li className="flex items-center gap-2 text-zinc-400">
                          <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>Standard review queue</span>
                        </li>
                        <li className="flex items-center gap-2 text-zinc-400">
                          <span className="w-3.5 h-3.5 text-zinc-600 text-center text-xs shrink-0">•</span>
                          <span>Nofollow backlink</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLaunchTier('free');
                        handleConfirmAndLaunch('free');
                      }}
                      className="mt-5 w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting && selectedLaunchTier === 'free' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Launch Free</span>
                      )}
                    </button>
                  </div>

                  {/* OPTION 2: Free + Embed Badge (RECOMMENDED / MOST POPULAR) */}
                  <div
                    onClick={() => {
                      setSelectedLaunchTier('badge');
                      if (!badgeVerifiedUrl) {
                        setIsEmbedBadgeModalOpen(true);
                      }
                    }}
                    className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedLaunchTier === 'badge'
                        ? 'bg-zinc-900 border-lime-400 shadow-[0_0_25px_rgba(163,230,53,0.15)] ring-2 ring-lime-400/40'
                        : 'bg-zinc-900/50 border-lime-500/30 hover:border-lime-400/60'
                    }`}
                  >
                    {/* Most Popular Pill */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Most Popular • 100% Free</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-lime-400 font-bold">Embed Badge</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold">$0 Free</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                          <span>Verified Instant Launch</span>
                        </h4>
                        <p className="text-xs text-zinc-300 mt-1">
                          Embed the MemeLaunch badge on your site to get instant live publish &amp; permanent Dofollow link.
                        </p>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-200 pt-2 border-t border-zinc-800/80">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                          <span className="font-semibold text-white">Instant live feed publication</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                          <span className="font-semibold text-lime-300">Permanent Dofollow backlink</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                          <span>Bot auto-verification in seconds</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                          <span>+200 bonus ranking points</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-5 space-y-2">
                      {badgeVerifiedUrl ? (
                        <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Badge Verified on site!</span>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLaunchTier('badge');
                          if (!badgeVerifiedUrl) {
                            setIsEmbedBadgeModalOpen(true);
                          } else {
                            handleConfirmAndLaunch('badge');
                          }
                        }}
                        className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-lime-400 hover:bg-lime-300 text-zinc-950 transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting && selectedLaunchTier === 'badge' ? (
                          <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                        ) : badgeVerifiedUrl ? (
                          <>
                            <span>Publish with Verified Badge 🚀</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify Badge &amp; Launch</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* OPTION 3: Instant Fast-Track ($4.99 via Whop) */}
                  <div
                    onClick={() => setSelectedLaunchTier('paid')}
                    className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedLaunchTier === 'paid'
                        ? 'bg-zinc-900 border-[#ffe600] shadow-[0_0_25px_rgba(255,230,0,0.15)] ring-2 ring-[#ffe600]/40'
                        : 'bg-zinc-900/50 border-amber-500/30 hover:border-[#ffe600]/60'
                    }`}
                  >
                    {/* VIP Pill */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffe600] text-zinc-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      <span>No Badge Needed</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#ffe600] font-bold">Fast-Track VIP</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#ffe600]/10 text-[#ffe600] border border-[#ffe600]/30 font-bold">$4.99 Once</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                          <span>Instant Pass ($4.99)</span>
                        </h4>
                        <p className="text-xs text-zinc-300 mt-1">
                          Skip adding any badge. Instant publish with permanent Dofollow backlink &amp; lifetime directory spot.
                        </p>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-200 pt-2 border-t border-zinc-800/80">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#ffe600] shrink-0" />
                          <span className="font-semibold text-white">Instant live feed publication</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#ffe600] shrink-0" />
                          <span className="font-semibold text-yellow-300">Permanent Dofollow backlink</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#ffe600] shrink-0" />
                          <span className="text-white">Forever stay in directory</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#ffe600] shrink-0" />
                          <span>No website embed required</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLaunchTier('paid');
                        handleConfirmAndLaunch('paid');
                      }}
                      className="mt-5 w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 transition-all shadow-[0_0_15px_rgba(255,230,0,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting && selectedLaunchTier === 'paid' ? (
                        <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay $4.99 &amp; Launch Instantly</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-center text-[11px] font-mono text-zinc-500 pt-1">
                  Secure one-time payments processed by Whop • Instant activation • Dofollow backlinks verified 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed Badge Modal for Option 2 Verification */}
      <EmbedBadgeModal
        isOpen={isEmbedBadgeModalOpen}
        onClose={() => setIsEmbedBadgeModalOpen(false)}
        productName={productName}
        defaultWebsiteUrl={productUrl}
        onVerified={(verifiedUrl) => {
          setBadgeVerifiedUrl(verifiedUrl);
          setIsEmbedBadgeModalOpen(false);
          // If user was ready to submit, proceed immediately
          if (user) {
            executeSubmission(user, 'badge');
          }
        }}
        onClaimSuccess={(newPoints) => {
          setUserPoints(newPoints);
        }}
        ctaLabel="Verify Embed & Complete Launch"
      />

      {/* Earn Points Modal Popup */}
      <EarnPointsModal
        isOpen={isEarnPointsModalOpen}
        onClose={() => setIsEarnPointsModalOpen(false)}
        onPointsUpdated={(newPts) => setUserPoints(newPts)}
      />

      {/* Post-Launch Boost to #1 Modal Popup */}
      <LaunchBoostModal
        isOpen={isBoostModalOpen}
        onClose={() => {
          setIsBoostModalOpen(false);
          router.push('/');
          router.refresh();
        }}
        launch={createdLaunchData}
        currentRank={1}
        currentPoints={userPoints}
        onPointsUpdated={(newPts) => setUserPoints(newPts)}
      />

      {/* Sign Up / Auth Modal Popup on Launch Submit */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async (authenticatedUser) => {
          setIsAuthModalOpen(false);
          const targetUser = authenticatedUser?.id
            ? authenticatedUser
            : authenticatedUser?.user?.id
            ? authenticatedUser.user
            : user;
          if (targetUser?.id) {
            await executeSubmission(targetUser);
          }
        }}
        title="Sign Up to Complete Your Launch"
        subtitle="Create a free account or log in to submit your product and appear on the home feed immediately."
      />
    </div>
  );
}
