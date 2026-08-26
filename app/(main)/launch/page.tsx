'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { uploadImageToStorage } from '@/lib/insforge';
import { compressImage } from '@/lib/image';
import { getUserPoints, getLaunchPointCost } from '@/lib/points';
import { EarnPointsModal } from '@/components/points/earn-points-modal';
import { AuthModal } from '@/components/auth/auth-modal';
import { z } from 'zod';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Globe,
  DollarSign,
  AlertCircle,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const CATEGORIES = [
  'SaaS',
  'Developer Tools',
  'AI & Machine Learning',
  'Mobile Apps',
  'Web Utilities',
  'Design & Creative',
  'Marketing & Sales',
  'Productivity',
  'Crypto & Web3',
  'E-Commerce',
  'Hardware',
  'Other'
];

const launchFormSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(2, 'Please select a product category'),
  pricing: z.enum(['free', 'paid', 'freemium']),
  productUrl: z.string().url('Please enter a valid product URL (e.g. https://example.com)'),
  productDescription: z.string().min(10, 'Product description must be at least 10 characters').max(500, 'Product description must be 500 characters or less'),
});

export default function LaunchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Loading launch environment...</p>
      </div>
    }>
      <LaunchForm />
    </Suspense>
  );
}

function LaunchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams ? searchParams.get('url') || searchParams.get('productUrl') : null;
  const { user, isLoading: authLoading } = useAuth();

  // Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [pricing, setPricing] = useState<'free' | 'paid' | 'freemium'>('free');
  const [productUrl, setProductUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // Meme upload (required)
  const [memeFile, setMemeFile] = useState<File | null>(null);
  const [memePreview, setMemePreview] = useState<string | null>(null);
  const memeInputRef = useRef<HTMLInputElement>(null);

  // Logo upload (required)
  const [productLogoFile, setProductLogoFile] = useState<File | null>(null);
  const [productLogoPreview, setProductLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Screenshots upload (2-3)
  const [screenshotFiles, setScreenshotFiles] = useState<(File | null)[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Submission / Loading states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Points & Auth Modal State
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isEarnPointsModalOpen, setIsEarnPointsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // AI Autofill state
  const [autofillUrl, setAutofillUrl] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillStep, setAutofillStep] = useState<number>(0);
  const [autofillSuccess, setAutofillSuccess] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);

  const handleAutofill = async (targetUrl?: string) => {
    const urlToUse = targetUrl || autofillUrl || productUrl;
    if (!urlToUse.trim()) {
      setAutofillError('Please enter your product website URL.');
      return;
    }

    setAutofillError(null);
    setIsAutofilling(true);
    setAutofillStep(1);
    setAutofillSuccess(false);

    try {
      const res = await fetch('/api/ai/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToUse }),
      });

      setAutofillStep(2);
      const json = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to extract product details.');
      }

      const { data } = json;

      if (data.productName) setProductName(data.productName);
      if (data.category && CATEGORIES.includes(data.category)) setCategory(data.category);
      if (data.pricing) setPricing(data.pricing);
      if (data.productDescription) setProductDescription(data.productDescription);
      const formattedUrl = urlToUse.startsWith('http') ? urlToUse : `https://${urlToUse}`;
      setProductUrl(formattedUrl);
      setAutofillUrl(formattedUrl);

      if (data.productLogoUrl) {
        try {
          const logoRes = await fetch(data.productLogoUrl);
          if (logoRes.ok) {
            const blob = await logoRes.blob();
            const file = new File([blob], 'product-logo.png', { type: blob.type || 'image/png' });
            setProductLogoFile(file);
            setProductLogoPreview(URL.createObjectURL(blob));
          } else {
            setProductLogoPreview(data.productLogoUrl);
          }
        } catch (err) {
          setProductLogoPreview(data.productLogoUrl);
        }
      }

      setAutofillSuccess(true);
      setFormErrors({});
    } catch (err: any) {
      setAutofillError(err.message || 'Failed to autofill form. Please complete fields manually.');
    } finally {
      setIsAutofilling(false);
      setAutofillStep(0);
    }
  };

  // Check user points on mount
  useEffect(() => {
    if (!user) return;
    async function checkPoints() {
      const pts = await getUserPoints(user!.id);
      setUserPoints(pts);
    }
    checkPoints();
  }, [user]);

  // Auto-fill from homepage query param on mount
  useEffect(() => {
    if (urlParam) {
      let formattedUrl = urlParam.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      setAutofillUrl(formattedUrl);
      setProductUrl(formattedUrl);
      handleAutofill(formattedUrl);
    }
  }, [urlParam]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (memePreview && memePreview.startsWith('blob:')) {
        URL.revokeObjectURL(memePreview);
      }
      if (productLogoPreview && productLogoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(productLogoPreview);
      }
      screenshotPreviews.forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [memePreview, productLogoPreview, screenshotPreviews]);

  // Handle meme file change
  const handleMemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (memePreview && memePreview.startsWith('blob:')) {
        URL.revokeObjectURL(memePreview);
      }
      setMemeFile(file);
      setMemePreview(URL.createObjectURL(file));
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy.meme;
        return copy;
      });
    }
  };

  const handleClearMeme = () => {
    if (memePreview && memePreview.startsWith('blob:')) {
      URL.revokeObjectURL(memePreview);
    }
    setMemeFile(null);
    setMemePreview(null);
  };

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (productLogoPreview && productLogoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(productLogoPreview);
      }
      setProductLogoFile(file);
      setProductLogoPreview(URL.createObjectURL(file));
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy.productLogo;
        return copy;
      });
    }
  };

  // Handle screenshot files selection
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = screenshotFiles.length;
    const remainingCount = 3 - currentCount;
    if (remainingCount <= 0) {
      alert('You can only upload up to 3 screenshots.');
      return;
    }

    const filesToAdd = files.slice(0, remainingCount);
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

    setScreenshotFiles((prev) => [...prev, ...filesToAdd]);
    setScreenshotPreviews((prev) => [...prev, ...newPreviews]);
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.screenshots;
      return copy;
    });
  };

  // Remove individual screenshot
  const removeScreenshot = (index: number) => {
    const previewToRemove = screenshotPreviews[index];
    if (previewToRemove && previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setStatusMessage('');

    let validUrl = productUrl.trim();
    if (validUrl && !validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    const validationResult = launchFormSchema.safeParse({
      productName: productName.trim(),
      category: category.trim(),
      pricing,
      productUrl: validUrl,
      productDescription: productDescription.trim(),
    });

    const errors: Record<string, string> = {};

    if (!validationResult.success) {
      validationResult.error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
    }

    if (!productLogoFile && !productLogoPreview) {
      errors.productLogo = 'Please upload a product logo';
    }

    if (!memeFile) {
      errors.meme = 'Please upload a product meme image (required)';
    }

    if (screenshotPreviews.length < 2) {
      errors.screenshots = 'Please upload at least 2 product screenshots (required)';
    }

    if (Object.keys(errors).length > 0) {
      const errorList = Object.values(errors);
      errors.submit = `Please fix the following issue(s): ${errorList.join('; ')}`;
      setFormErrors(errors);
      return;
    }

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    await executeSubmission(user);
  };

  const executeSubmission = async (authUser: any) => {
    let validUrl = productUrl.trim();
    if (validUrl && !validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    const feeInfo = await getLaunchPointCost(authUser.id);
    const currentPoints = await getUserPoints(authUser.id);
    if (feeInfo.requiredPoints > 0 && currentPoints < feeInfo.requiredPoints) {
      setFormErrors({ submit: `Product launch requires ${feeInfo.requiredPoints} points. You currently have ${currentPoints} points.` });
      setIsEarnPointsModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload Meme (Required)
      let memeImageUrl = '';
      if (memeFile) {
        setStatusMessage('Compressing product meme...');
        const compressedMemeBlob = await compressImage(memeFile, 1200, 0.8);
        const compressedMemeFile = new File([compressedMemeBlob], memeFile.name, {
          type: 'image/jpeg',
        });

        setStatusMessage('Uploading product meme...');
        const memeExtension = memeFile.name.split('.').pop() || 'jpg';
        const memePath = `${authUser.id}/${Date.now()}_meme.${memeExtension}`;

        memeImageUrl = await uploadImageToStorage(compressedMemeFile, 'memes', memePath);
      }

      // Step 2: Upload Product Logo
      let logoUrl = '';
      if (productLogoFile) {
        setStatusMessage('Compressing product logo...');
        const compressedLogoBlob = await compressImage(productLogoFile, 400, 0.8);
        const compressedLogoFile = new File([compressedLogoBlob], productLogoFile.name, {
          type: 'image/jpeg',
        });

        setStatusMessage('Uploading product logo...');
        const logoExtension = productLogoFile.name.split('.').pop() || 'jpg';
        const logoPath = `${authUser.id}/${Date.now()}_logo.${logoExtension}`;

        logoUrl = await uploadImageToStorage(compressedLogoFile, 'memes', logoPath);
      } else if (productLogoPreview) {
        logoUrl = productLogoPreview;
      }

      // Step 3: Upload Screenshots
      const uploadedScreenshotUrls: string[] = [];
      for (let i = 0; i < screenshotPreviews.length; i++) {
        const file = screenshotFiles[i];
        const preview = screenshotPreviews[i];

        if (file === null) {
          uploadedScreenshotUrls.push(preview);
        } else if (file) {
          setStatusMessage(`Compressing screenshot ${i + 1} of ${screenshotPreviews.length}...`);
          const compressedBlob = await compressImage(file, 1200, 0.8);
          const compressedFile = new File([compressedBlob], file.name, {
            type: 'image/jpeg',
          });

          setStatusMessage(`Uploading screenshot ${i + 1}...`);
          const fileExtension = file.name.split('.').pop() || 'jpg';
          const screenshotPath = `${authUser.id}/${Date.now()}_screenshot_${i}.${fileExtension}`;

          const screenshotUrl = await uploadImageToStorage(compressedFile, 'screenshots', screenshotPath);
          uploadedScreenshotUrls.push(screenshotUrl);
        }
      }

      // Step 4: Submit launch via /api/launch/create (bypasses browser RLS policy constraints)
      setStatusMessage('Publishing launch details...');
      const createRes = await fetch('/api/launch/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authUser.id,
          memeImageUrl,
          productName: productName.trim(),
          productUrl: validUrl,
          pricing,
          category: category.trim(),
          productDescription: productDescription.trim(),
          productLogoUrl: logoUrl,
          screenshotUrls: uploadedScreenshotUrls,
        }),
      });

      const createJson = await createRes.json();
      if (!createRes.ok || !createJson.success) {
        throw new Error(createJson.error || 'Failed to create product launch.');
      }

      const updatedPts = await getUserPoints(authUser.id);
      setUserPoints(updatedPts);

      setStatusMessage('');
      setSuccessMessage('🎉 Product launched successfully! Redirecting...');

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);

    } catch (err: any) {
      console.error('Launch error:', err);
      setFormErrors({ submit: err.message || 'An unexpected error occurred during submission.' });
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Loading launch environment...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="font-impact text-3xl md:text-5xl uppercase tracking-tight text-zinc-50">
          LAUNCH <span className="text-lime-400">YOUR PRODUCT</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Submit your product details and meme to launch to the community feed.
        </p>
      </div>

      {successMessage ? (
        <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/40 border border-lime-400/20 rounded-3xl text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <div className="h-16 w-16 bg-lime-400/10 border border-lime-400/20 rounded-full flex items-center justify-center text-lime-400 animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Mission Accomplished!</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Validation Error Banner */}
          {formErrors.submit && (
            <div id="launch-error-banner" className="p-4 bg-rose-950/60 border-2 border-rose-600 rounded-2xl flex gap-3 text-rose-300 text-sm shadow-2xl animate-in fade-in">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-200">Unable to Submit Launch</p>
                <p className="text-xs leading-relaxed">{formErrors.submit}</p>
              </div>
            </div>
          )}

          {/* AI Autofill Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-lime-950/40 via-zinc-900 to-lime-950/20 border border-lime-500/30 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="url"
                  placeholder="https://yourproduct.com"
                  value={autofillUrl}
                  onChange={(e) => setAutofillUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAutofill();
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAutofill()}
                disabled={isAutofilling}
                className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-400/10 shrink-0"
              >
                {isAutofilling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{autofillStep === 1 ? 'Reading HTML...' : 'DeepSeek Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Autofill with AI</span>
                  </>
                )}
              </button>
            </div>

            {autofillError && (
              <p className="mt-3 text-xs text-red-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {autofillError}
              </p>
            )}

            {autofillSuccess && (
              <p className="mt-3 text-xs text-lime-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Product details autofilled! Upload your meme below to complete your launch.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: LIVE PRODUCT CARD PREVIEW (5 Cols - Sticky) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400"></span>
                  </span>
                  Live Feed Card Preview
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                  Feed Appearance
                </span>
              </div>

              {/* Feed Card Mockup Container */}
              <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-zinc-700">
                {/* Image Header Preview */}
                <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden border-b border-zinc-800/80 group flex items-center justify-center">
                  {memePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={memePreview}
                      alt="Product Meme Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : screenshotPreviews[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={screenshotPreviews[0]}
                      alt="Product Screenshot Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : productLogoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={productLogoPreview}
                      alt="Product Logo Preview"
                      className="w-24 h-24 object-contain rounded-2xl p-2 bg-zinc-950 border border-zinc-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900">
                      <Sparkles className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
                      <p className="text-xs font-mono text-zinc-500">Meme Cover Preview</p>
                      <p className="text-[11px] text-zinc-600 mt-1">Upload product meme to preview</p>
                    </div>
                  )}
                </div>

                {/* Card Content Details */}
                <div className="p-5 space-y-4">
                  {/* Header Row: Logo, Name, Category & Price */}
                  <div className="flex items-start gap-3">
                    {productLogoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productLogoPreview}
                        alt="Product Logo"
                        className="h-10 w-10 rounded-xl object-cover border border-zinc-800 bg-zinc-900 shrink-0 shadow-md"
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
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase font-bold tracking-wider shrink-0 ${
                          pricing === 'free'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : pricing === 'freemium'
                            ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                            : 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                        }`}>
                          {pricing === 'free' ? 'Free' : pricing === 'freemium' ? 'Freemium' : 'Paid'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-mono">
                          <Tag className="h-3 w-3 text-lime-400" />
                          <span>{category || 'Uncategorized'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {productDescription || 'Your product description will appear here on the community launch feed...'}
                  </p>

                  {/* Product URL & Website Link Mockup */}
                  {productUrl && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                      <span className="truncate max-w-[200px] text-zinc-500">{productUrl}</span>
                      <span className="text-lime-400 font-bold hover:underline flex items-center gap-1">
                        Visit Site <ArrowRight className="w-3 h-3" />
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

              {/* Status Message Overlay when uploading */}
              {isSubmitting && statusMessage && (
                <div className="p-4 bg-lime-950/30 border border-lime-500/30 rounded-2xl flex items-center gap-3 text-lime-400 text-sm font-mono shadow-xl animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-lime-400" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT SPECIFICATIONS & FORM (7 Cols) */}
            <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl backdrop-blur-sm">

              {/* Product Specifications Section */}
              <div className="space-y-6">
                <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold flex items-center gap-2 text-zinc-100">
                    <Tag className="h-5 w-5 text-lime-400" />
                    <span>Product Details</span>
                  </h2>
                  <span className="text-[11px] font-mono text-zinc-500">Public Product Info</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="space-y-1.5" id="err-productName">
                    <label htmlFor="productName" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                      Product Name
                    </label>
                    <input
                      id="productName"
                      type="text"
                      required
                      placeholder="e.g. MemeLaunch"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.productName ? 'border-rose-500/60' : 'border-zinc-800/80'} rounded-xl text-sm focus:outline-none focus:border-lime-400 text-zinc-100 placeholder-zinc-600 transition-colors`}
                    />
                    {formErrors.productName && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-mono">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.productName}
                      </p>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-1.5" id="err-category">
                    <label htmlFor="category" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.category ? 'border-rose-500/60' : 'border-zinc-800/80'} rounded-xl text-sm focus:outline-none focus:border-lime-400 text-zinc-100 transition-colors cursor-pointer appearance-none`}
                      >
                        <option value="" disabled className="text-zinc-600">Select a category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-zinc-950 text-zinc-100">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                    {formErrors.category && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-mono">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product URL */}
                <div className="space-y-1.5" id="err-productUrl">
                  <label htmlFor="productUrl" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Product Link (URL)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      id="productUrl"
                      type="url"
                      required
                      placeholder="https://yourproduct.com"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 bg-zinc-950 border ${formErrors.productUrl ? 'border-rose-500/60' : 'border-zinc-800/80'} rounded-xl text-sm focus:outline-none focus:border-lime-400 text-zinc-100 placeholder-zinc-600 transition-colors`}
                    />
                  </div>
                  {formErrors.productUrl && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-mono">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.productUrl}
                    </p>
                  )}
                </div>

                {/* Product Description */}
                <div className="space-y-1.5" id="err-productDescription">
                  <div className="flex items-center justify-between">
                    <label htmlFor="productDescription" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                      Product Description
                    </label>
                    <span className={`text-[11px] font-mono ${productDescription.length > 500 ? 'text-rose-400' : 'text-zinc-500'}`}>
                      {productDescription.length}/500 chars
                    </span>
                  </div>
                  <textarea
                    id="productDescription"
                    rows={3}
                    maxLength={500}
                    required
                    placeholder="Tell us what your product does. Keep it punchy, clear, and direct."
                    value={productDescription}
                    onChange={(e) => {
                      setProductDescription(e.target.value);
                      if (formErrors.productDescription) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.productDescription;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.productDescription ? 'border-rose-500/60' : 'border-zinc-800/80'} rounded-xl text-sm focus:outline-none focus:border-lime-400 text-zinc-100 placeholder-zinc-600 transition-colors resize-none`}
                  />
                  {formErrors.productDescription && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-mono">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.productDescription}
                    </p>
                  )}
                </div>

                {/* Pricing Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Pricing Model
                  </label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'free', label: 'Free' },
                      { id: 'freemium', label: 'Freemium' },
                      { id: 'paid', label: 'Paid Only' }
                    ].map((item) => {
                      const isSelected = pricing === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPricing(item.id as any)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1 cursor-pointer ${
                            isSelected 
                              ? 'bg-lime-400/10 border-lime-400 text-lime-400 font-bold shadow-[0_0_15px_rgba(163,230,53,0.15)]' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <DollarSign className="h-4 w-4 stroke-[2]" />
                          <span className="text-xs font-mono">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Product Logo Upload (Directly Above Screenshots) */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80" id="err-productLogo">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold flex items-center gap-2 text-zinc-100">
                    <Upload className="h-5 w-5 text-lime-400" />
                    <span>Product Logo <span className="text-lime-400">*</span></span>
                  </h2>
                  <span className="text-xs font-mono text-zinc-500">1:1 Square Logo</span>
                </div>

                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className={`flex-1 border-2 border-dashed ${formErrors.productLogo ? 'border-rose-500/50 bg-rose-950/5' : 'border-zinc-800 hover:border-lime-400/50 bg-zinc-950'} rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-zinc-900/40 group`}
                  >
                    <input
                      ref={logoInputRef}
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Upload className="h-5 w-5 text-zinc-500 group-hover:text-lime-400 mx-auto mb-1 stroke-[1.5] transition-colors" />
                    <p className="text-xs font-semibold text-zinc-300">
                      {productLogoFile
                        ? productLogoFile.name
                        : productLogoPreview
                        ? 'Logo extracted from website (Click to replace)'
                        : 'Upload logo image (1:1 square recommended)'}
                    </p>
                  </div>
                  {productLogoPreview && (
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-zinc-800 shrink-0 bg-zinc-950 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={productLogoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
                {formErrors.productLogo && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-mono">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {formErrors.productLogo}
                  </p>
                )}
              </div>

              {/* Product Screenshots Section (2-3 required) */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold flex items-center gap-2 text-zinc-100">
                    <Upload className="h-5 w-5 text-lime-400" />
                    <span>Product Screenshots <span className="text-lime-400">*</span></span>
                  </h2>
                  <span className="text-xs font-mono text-zinc-500">
                    {`${screenshotPreviews.length}/3 uploaded (2 required)`}
                  </span>
                </div>

                {/* Dropzone & Previews */}
                <div className="space-y-4" id="err-screenshots">
                  {screenshotPreviews.length < 3 && (
                    <div 
                      onClick={() => screenshotInputRef.current?.click()}
                      className={`border-2 border-dashed ${formErrors.screenshots ? 'border-rose-500/50 bg-rose-950/5' : 'border-zinc-800 hover:border-lime-400/50 bg-zinc-950'} rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-zinc-900/40 group`}
                    >
                      <input
                        ref={screenshotInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                      <Upload className="h-6 w-6 text-zinc-500 group-hover:text-lime-400 mx-auto mb-2 stroke-[1.5] transition-colors" />
                      <p className="text-sm font-semibold text-zinc-300">
                        Upload product screenshots
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 font-mono">
                        Upload 2 or 3 app screenshots to showcase your product features.
                      </p>
                    </div>
                  )}

                  {/* Previews grid */}
                  {screenshotPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {screenshotPreviews.map((preview, index) => (
                        <div key={index} className="group relative aspect-[16/10] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-zinc-950/80 hover:bg-rose-950/90 text-zinc-400 hover:text-rose-400 rounded-md border border-zinc-800 hover:border-rose-800/50 opacity-0 group-hover:opacity-100 transition-all shadow"
                            title="Delete screenshot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <div className="absolute bottom-1 left-2 bg-zinc-950/80 px-1.5 py-0.5 rounded font-mono text-[9px] text-zinc-400 border border-zinc-800">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formErrors.screenshots && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-mono">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.screenshots}
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Meme Section (Required) */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80" id="err-meme">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold flex items-center gap-2 text-zinc-100">
                    <Sparkles className="h-5 w-5 text-lime-400" />
                    <span>Upload Product Meme <span className="text-lime-400">*</span></span>
                  </h2>
                  <span className="text-xs font-mono text-zinc-500">
                    Required Meme Image
                  </span>
                </div>

                <div className="space-y-3">
                  <div 
                    onClick={() => memeInputRef.current?.click()}
                    className={`border-2 border-dashed ${formErrors.meme ? 'border-rose-500/50 bg-rose-950/5' : 'border-zinc-800 hover:border-lime-400/50 bg-zinc-950'} rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-zinc-900/40 group`}
                  >
                    <input
                      ref={memeInputRef}
                      type="file"
                      id="meme-upload"
                      accept="image/*"
                      onChange={handleMemeChange}
                      className="hidden"
                    />
                    <Sparkles className="h-6 w-6 text-zinc-500 group-hover:text-lime-400 mx-auto mb-2 stroke-[1.5] transition-colors" />
                    <p className="text-sm font-semibold text-zinc-300">
                      {memeFile ? memeFile.name : 'Upload your product meme image'}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 font-mono">
                      Upload a relatable or funny meme that highlights your product features.
                    </p>
                  </div>

                  {memePreview && (
                    <div className="relative aspect-[16/10] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-md group max-w-sm mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={memePreview}
                        alt="Meme preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleClearMeme}
                        className="absolute top-2 right-2 p-1.5 bg-zinc-950/80 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded-lg border border-zinc-800 hover:border-rose-800/50 transition-all opacity-0 group-hover:opacity-100 shadow"
                        title="Remove meme"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {formErrors.meme && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-mono">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.meme}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Bar Error Notice */}
              {formErrors.submit && (
                <div className="p-3 bg-rose-950/50 border border-rose-600/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{formErrors.submit}</span>
                </div>
              )}

              {/* Launch CTA Action Bar */}
              <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-end gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-[0_0_25px_rgba(163,230,53,0.2)] hover:shadow-[0_0_40px_rgba(163,230,53,0.35)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
                      <span>Publishing Launch...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Product</span>
                      <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </form>
      )}

      {/* Earn Points Modal Popup */}
      <EarnPointsModal
        isOpen={isEarnPointsModalOpen}
        onClose={() => setIsEarnPointsModalOpen(false)}
        onPointsUpdated={(newPts) => setUserPoints(newPts)}
      />

      {/* Sign Up / Auth Modal Popup on Launch Submit */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(authenticatedUser) => {
          setIsAuthModalOpen(false);
          const targetUser = authenticatedUser || user;
          if (targetUser) {
            executeSubmission(targetUser);
          }
        }}
        title="Sign Up to Complete Your Launch"
        subtitle="Create a free account or log in to submit your product, earn points, and appear on the home feed."
      />
    </div>
  );
}
