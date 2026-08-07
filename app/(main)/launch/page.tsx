'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { MemeStudio, MemeStudioRef } from '@/components/editor/meme-studio';
import { insforge, resolveStorageUrl } from '@/lib/insforge';
import { compressImage } from '@/lib/image';
import { getUserPoints, deductPointsForLaunch } from '@/lib/points';
import { EarnPointsModal } from '@/components/points/earn-points-modal';
import { z } from 'zod';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Globe,
  DollarSign,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Repeat,
  Zap
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  thumbnail_url: string;
  active_week: number;
  usage_count: number;
}

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
  const { user, isLoading: authLoading } = useAuth();

  // Templates list
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [pricing, setPricing] = useState<'free' | 'paid' | 'freemium'>('free');
  const [productUrl, setProductUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productLogoFile, setProductLogoFile] = useState<File | null>(null);
  const [productLogoPreview, setProductLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [captionPosition, setCaptionPosition] = useState<'above' | 'below' | 'both'>('below');
  const [textAbove, setTextAbove] = useState('');
  const [textBelow, setTextBelow] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  const [topAbove, setTopAbove] = useState(15);
  const [leftAbove, setLeftAbove] = useState(50);
  const [topBelow, setTopBelow] = useState(85);
  const [leftBelow, setLeftBelow] = useState(50);
  const [widthAbove, setWidthAbove] = useState(90);
  const [widthBelow, setWidthBelow] = useState(90);
  const [preferredCycle, setPreferredCycle] = useState<'current' | 'next'>('current');
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const memeStudioRef = useRef<MemeStudioRef>(null);

  // Drag handler for caption positioning
  const handleStartDrag = (type: 'above' | 'below', e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = previewContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const handleMove = (clientX: number, clientY: number) => {
      // Calculate percentage inside container (0 to 100)
      const xPercent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

      if (type === 'above') {
        setLeftAbove(Math.round(xPercent));
        setTopAbove(Math.round(yPercent));
      } else {
        setLeftBelow(Math.round(xPercent));
        setTopBelow(Math.round(yPercent));
      }
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    const onTouchMove = (touchEvent: TouchEvent) => {
      if (touchEvent.touches[0]) {
        handleMove(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    if ('touches' in e) {
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    } else {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  // Drag handler for edge pulling / length resizing
  const handleStartResize = (type: 'above' | 'below', e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent drag-to-move trigger
    e.preventDefault();
    const container = previewContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const leftPercent = type === 'above' ? leftAbove : leftBelow;
    const centerX = rect.left + (leftPercent / 100) * rect.width;

    const handleMove = (clientX: number) => {
      const deltaX = Math.abs(clientX - centerX);
      const widthPercent = Math.max(15, Math.min(100, ((2 * deltaX) / rect.width) * 100));

      if (type === 'above') {
        setWidthAbove(Math.round(widthPercent));
      } else {
        setWidthBelow(Math.round(widthPercent));
      }
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleMove(moveEvent.clientX);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    const onTouchMove = (touchEvent: TouchEvent) => {
      if (touchEvent.touches[0]) {
        handleMove(touchEvent.touches[0].clientX);
      }
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    if ('touches' in e) {
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    } else {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  // Image states
  const [imageSource, setImageSource] = useState<'upload' | 'template'>('upload');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Custom Meme upload
  const [memeFile, setMemeFile] = useState<File | null>(null);
  const [memePreview, setMemePreview] = useState<string | null>(null);
  const memeInputRef = useRef<HTMLInputElement>(null);

  // Screenshots upload (2-3)
  const [screenshotFiles, setScreenshotFiles] = useState<(File | null)[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Submission / Loading states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Points State
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isEarnPointsModalOpen, setIsEarnPointsModalOpen] = useState(false);

  // Check user points on mount
  useEffect(() => {
    if (!user) return;
    async function checkPoints() {
      const pts = await getUserPoints(user!.id);
      setUserPoints(pts);
      if (pts < 15) {
        setIsEarnPointsModalOpen(true);
      }
    }
    checkPoints();
  }, [user]);

  // Remix mechanics
  const searchParams = useSearchParams();

  // Fetch Templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data, error } = await insforge.database
          .from('templates')
          .select('*')
          .order('name', { ascending: true });
        
        if (!error && data) {
          setTemplates(data as Template[]);
          // Select first template as default if template tab is clicked
          if (data.length > 0) {
            setSelectedTemplate(data[0] as Template);
          }
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    }

    fetchTemplates();
  }, []);



  // Pre-select template from query parameter if applicable
  const templateQueryId = searchParams.get('template');
  useEffect(() => {
    if (templateQueryId && templates.length > 0) {
      const matched = templates.find((t) => t.id === templateQueryId);
      if (matched) {
        setSelectedTemplate(matched);
        setImageSource('template');
      }
    }
  }, [templateQueryId, templates]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Clean up object URLs to avoid memory leaks
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

    // Maintain max 3 screenshots total
    const currentCount = screenshotFiles.length;
    const remainingCount = 3 - currentCount;
    if (remainingCount <= 0) {
      alert('You can only upload up to 3 screenshots.');
      return;
    }

    const filesToAdd = files.slice(0, remainingCount);
    
    // Create previews
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

    setScreenshotFiles((prev) => [...prev, ...filesToAdd]);
    setScreenshotPreviews((prev) => [...prev, ...newPreviews]);
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.screenshots;
      return copy;
    });
  };

  // Remove a screenshot
  const removeScreenshot = (index: number) => {
    URL.revokeObjectURL(screenshotPreviews[index]);
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };



  // Submit form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Reset messages and errors
    setFormErrors({});
    setStatusMessage('');
    setSuccessMessage('');

    // 1. Zod Validation
    const fieldsToValidate = {
      productName,
      category,
      pricing,
      productUrl,
      productDescription,
    };

    const validationResult = launchFormSchema.safeParse(fieldsToValidate);
    const errors: Record<string, string> = {};

    if (!validationResult.success) {
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
    }

    // Validate caption above
    if (captionPosition === 'above' || captionPosition === 'both') {
      if (!textAbove.trim()) {
        errors.textAbove = 'Caption above is required';
      } else if (textAbove.length < 3) {
        errors.textAbove = 'Caption above must be at least 3 characters';
      } else if (textAbove.length > 100) {
        errors.textAbove = 'Caption above must be 100 characters or less';
      }
    }

    // Validate caption below
    if (captionPosition === 'below' || captionPosition === 'both') {
      if (!textBelow.trim()) {
        errors.textBelow = 'Caption below is required';
      } else if (textBelow.length < 3) {
        errors.textBelow = 'Caption below must be at least 3 characters';
      } else if (textBelow.length > 100) {
        errors.textBelow = 'Caption below must be 100 characters or less';
      }
    }

    // 2. Custom validation for files
    if (!productLogoFile) {
      errors.productLogo = 'Please upload a product logo';
    }

    if (imageSource === 'upload' && !memeFile) {
      errors.meme = 'Please upload a meme image';
    }
    if (imageSource === 'template' && !selectedTemplate) {
      errors.meme = 'Please select a template';
    }

    if (screenshotPreviews.length < 2) {
      errors.screenshots = 'Please upload at least 2 product screenshots (required)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(`err-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const currentPoints = await getUserPoints(user.id);
    if (currentPoints < 15) {
      setFormErrors({ submit: `Product launch requires 15 points. You currently have ${currentPoints} points.` });
      setIsEarnPointsModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Step A0: Compress and Upload Product Logo
      let logoUrl = '';
      if (productLogoFile) {
        setStatusMessage('Compressing product logo...');
        const compressedLogoBlob = await compressImage(productLogoFile, 400, 0.8);
        const compressedLogoFile = new File([compressedLogoBlob], productLogoFile.name, {
          type: 'image/jpeg',
        });

        setStatusMessage('Uploading product logo to S3...');
        const logoExtension = productLogoFile.name.split('.').pop() || 'jpg';
        const logoPath = `${user.id}/${Date.now()}_logo.${logoExtension}`;

        const { data: logoUploadData, error: logoUploadError } = await insforge.storage
          .from('memes')
          .upload(logoPath, compressedLogoFile);

        if (logoUploadError || !logoUploadData) {
          throw new Error(logoUploadError?.message || 'Logo upload failed.');
        }

        logoUrl = logoUploadData.url;
      }

      // Step A: Export & Upload Canvas Meme Image from MemeStudio
      let memeImageUrl = '';
      const studioCanvasBlob = memeStudioRef.current ? await memeStudioRef.current.getCanvasBlob() : null;

      if (studioCanvasBlob) {
        setStatusMessage('Exporting studio canvas meme...');
        const studioMemeFile = new File([studioCanvasBlob], `meme_${Date.now()}.png`, { type: 'image/png' });
        const memePath = `${user.id}/${Date.now()}_studio_meme.png`;
        const { data: uploadData, error: uploadError } = await insforge.storage
          .from('memes')
          .upload(memePath, studioMemeFile);

        if (uploadError || !uploadData) {
          throw new Error(uploadError?.message || 'Meme canvas upload failed.');
        }
        memeImageUrl = uploadData.url;
      } else if (imageSource === 'upload' && memeFile) {
        setStatusMessage('Compressing meme image...');
        const compressedMemeBlob = await compressImage(memeFile, 1200, 0.8);
        const compressedMemeFile = new File([compressedMemeBlob], memeFile.name, {
          type: 'image/jpeg',
        });

        setStatusMessage('Uploading meme to S3...');
        const fileExtension = memeFile.name.split('.').pop() || 'jpg';
        const memePath = `${user.id}/${Date.now()}_meme.${fileExtension}`;

        const { data: uploadData, error: uploadError } = await insforge.storage
          .from('memes')
          .upload(memePath, compressedMemeFile);

        if (uploadError || !uploadData) {
          throw new Error(uploadError?.message || 'Meme upload failed.');
        }

        memeImageUrl = uploadData.url;
      } else if (imageSource === 'template' && selectedTemplate) {
        memeImageUrl = selectedTemplate.thumbnail_url;
      }

      // Step B: Compress and Upload Screenshots
      const uploadedScreenshotUrls: string[] = [];
      for (let i = 0; i < screenshotPreviews.length; i++) {
        const file = screenshotFiles[i];
        const preview = screenshotPreviews[i];

        if (file === null) {
          // Cloned screenshot: use URL directly
          uploadedScreenshotUrls.push(preview);
        } else if (file) {
          // Newly uploaded screenshot: upload
          setStatusMessage(`Compressing screenshot ${i + 1} of ${screenshotPreviews.length}...`);
          const compressedBlob = await compressImage(file, 1200, 0.8);
          const compressedFile = new File([compressedBlob], file.name, {
            type: 'image/jpeg',
          });

          setStatusMessage(`Uploading screenshot ${i + 1} to S3...`);
          const fileExtension = file.name.split('.').pop() || 'jpg';
          const screenshotPath = `${user.id}/${Date.now()}_screenshot_${i}.${fileExtension}`;

          const { data: uploadData, error: uploadError } = await insforge.storage
            .from('screenshots')
            .upload(screenshotPath, compressedFile);

          if (uploadError || !uploadData) {
            throw new Error(uploadError?.message || `Screenshot ${i + 1} upload failed.`);
          }

          uploadedScreenshotUrls.push(uploadData.url);
        }
      }

      // Compile final JSON caption
      const finalCaptionJson = JSON.stringify({
        textAbove: captionPosition === 'below' ? '' : textAbove.trim(),
        textBelow: captionPosition === 'above' ? '' : textBelow.trim(),
        position: captionPosition,
        color: textColor,
        size: textSize,
        topAbove,
        leftAbove,
        topBelow,
        leftBelow,
        widthAbove,
        widthBelow,
      });

      // Step C: Insert into Launches table
      setStatusMessage('Publishing launch details...');
      const { data: launchData, error: launchError } = await insforge.database
        .from('launches')
        .insert([
          {
            user_id: user.id,
            meme_image_url: memeImageUrl,
            caption: finalCaptionJson,
            product_name: productName.trim(),
            product_url: productUrl.trim(),
            pricing: pricing,
            category: category.trim(),
            template_id: (imageSource === 'template' && selectedTemplate ? selectedTemplate.id : null),
            product_description: productDescription.trim(),
            product_logo_url: logoUrl,
          },
        ])
        .select();

      if (launchError || !launchData || launchData.length === 0) {
        throw new Error(launchError?.message || 'Failed to create product launch row.');
      }

      const launchId = launchData[0].id;



      // Step D: Insert into Launch Screenshots table
      setStatusMessage('Linking screenshots...');
      const screenshotInserts = uploadedScreenshotUrls.map((url, idx) => ({
        launch_id: launchId,
        image_url: url,
        order: idx + 1,
      }));

      const { error: screenshotsError } = await insforge.database
        .from('launch_screenshots')
        .insert(screenshotInserts);

      if (screenshotsError) {
        throw new Error(screenshotsError.message || 'Failed to link screenshots.');
      }

      // Step E: Update Template Usage (if applicable)
      if (imageSource === 'template' && selectedTemplate) {
        await insforge.database
          .from('templates')
          .update({ usage_count: (selectedTemplate.usage_count || 0) + 1 })
          .eq('id', selectedTemplate.id);
      }

      // Step F: Deduct 15 Points
      setStatusMessage('Deducting 15 points for product launch...');
      await deductPointsForLaunch(user.id);
      const updatedPts = await getUserPoints(user.id);
      setUserPoints(updatedPts);

      setStatusMessage('');
      setSuccessMessage(
        '🎉 Product launched successfully! It will go live after admin approval. Redirecting back...'
      );

      // Redirect home after brief delay
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

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Verifying founder credentials...</p>
      </div>
    );
  }

  // Previews calculated for card layout preview on the left side
  const memePreviewSource = imageSource === 'template' && selectedTemplate 
    ? selectedTemplate.thumbnail_url 
    : memePreview;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <>
            <h1 className="font-impact text-3xl md:text-5xl uppercase tracking-tight text-zinc-50">
              LAUNCH <span className="text-lime-400">YOUR PRODUCT</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Craft a viral meme, tuck the tech specs underneath, and launch it to the world. Took you longer to read this than it will to launch.
            </p>
          </>
        </div>
      </div>

      {/* Points Alert Banner */}
      {userPoints < 15 ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffe600]/10 border-2 border-[#ffe600] rounded-2xl p-4 shadow-brutal-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#ffe600] text-zinc-950 flex items-center justify-center font-black shrink-0 border border-black shadow">
              <Zap className="h-5 w-5 fill-zinc-950" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-zinc-100 uppercase">15 Points Required to Publish</h4>
              <p className="text-zinc-400 text-xs">
                You currently have <span className="text-[#ffe600] font-bold">{userPoints} points</span>. Earn {15 - userPoints} more points to launch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEarnPointsModalOpen(true)}
            className="px-4 py-2 bg-[#ffe600] text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all shrink-0 inline-flex items-center gap-1.5"
          >
            <span>Earn Points Now</span>
            <Zap className="h-3.5 w-3.5 fill-zinc-950" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-zinc-900 border-2 border-black rounded-2xl p-3 px-4 shadow-brutal-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase">
            <Zap className="h-4 w-4 text-[#ffe600] fill-[#ffe600]" />
            <span>Launch Fee: <strong className="text-[#ffe600]">15 Points</strong> (Your Balance: <strong>{userPoints} Pts</strong>)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEarnPointsModalOpen(true)}
            className="text-xs text-zinc-400 hover:text-[#ffe600] font-bold uppercase transition-colors underline"
          >
            Earn More
          </button>
        </div>
      )}

      {successMessage ? (
        <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/40 border border-lime-400/20 rounded-3xl text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <div className="h-16 w-16 bg-lime-400/10 border border-lime-400/20 rounded-full flex items-center justify-center text-lime-400 animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Mission Accomplished!</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: LIVE STUDIO EDITOR (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">
                Professional Meme Studio
              </span>
              
              <MemeStudio
                ref={memeStudioRef}
                imageUrl={memePreviewSource ? resolveStorageUrl(memePreviewSource) : null}
                productLogoUrl={productLogoPreview}
                textAbove={textAbove}
                textBelow={textBelow}
              />
            </div>

                {/* Details Bar Mockup */}
                <div className="p-4 bg-zinc-900/40 space-y-4">
                  <div className="flex items-center gap-3">
                    {productLogoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productLogoPreview}
                        alt="Logo preview"
                        className="h-9 w-9 rounded-xl object-cover border border-zinc-850 bg-zinc-950 shrink-0 shadow-md"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-xl border border-dashed border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-650 font-mono text-[10px] uppercase tracking-wider font-extrabold shrink-0">
                        Logo
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-base text-zinc-100 truncate">
                          {productName || 'Product Name'}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase font-bold tracking-wider shrink-0">
                          {pricing}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1 bg-zinc-950/40 border border-zinc-800/60 px-2 py-0.5 rounded-md text-[11px]">
                      <Tag className="h-3 w-3" />
                      <span>{category || 'Category'}</span>
                    </span>
                  </div>

                  {/* Fake Reactions panel */}
                  <div className="flex items-center justify-between gap-1 bg-zinc-950/30 border border-zinc-800/40 rounded-xl p-1 pointer-events-none opacity-60">
                    <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs font-mono text-zinc-500">
                      <span>🔥</span> 0
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs font-mono text-zinc-500">
                      <span>😂</span> 0
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs font-mono text-zinc-500">
                      <span>🤔</span> 0
                    </div>
                  </div>
                </div>
              </div>

            {/* Error display on submit failure */}
            {formErrors.submit && (
              <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-2xl flex gap-3 text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold">Launch Failed</p>
                  <p className="text-xs text-red-300/90">{formErrors.submit}</p>
                </div>
              </div>
            )}

            {/* Status Message Overlay when uploading */}
            {isSubmitting && statusMessage && (
              <div className="p-4 bg-lime-950/30 border border-lime-500/20 rounded-2xl flex items-center gap-3 text-lime-400 text-sm font-mono shadow-md animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-lime-400" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: FIELDS & UPLOADS (7 Cols) */}
          <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 space-y-8">
            
            {/* World Cup Strategy Selector */}
            <div className="space-y-3 p-4 bg-gradient-to-r from-amber-500/10 via-zinc-950 to-amber-500/5 border border-amber-500/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏆</span>
                <label className="text-sm font-extrabold text-white">
                  World Cup Entry Strategy
                </label>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold ml-auto">
                  48h Strategy Choice
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Choose how your launch enters the weekly World Cup qualification race:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredCycle('current')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preferredCycle === 'current'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                    <span>🚀</span>
                    <span>I&apos;m Confident! (This Week)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Enter this week&apos;s race immediately. Great if you have an audience ready to vote!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredCycle('next')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preferredCycle === 'next'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                    <span>🛡️</span>
                    <span>Safe Play (Next Week)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Get a full 7 days on the main feed to accumulate reactions naturally for next week.
                  </p>
                </button>
              </div>
            </div>

            {/* Section 1: Meme Content */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-zinc-800 pb-3 flex items-center gap-2 text-zinc-200">
                <Sparkles className="h-5 w-5 text-lime-400" />
                <span>Meme Setup</span>
              </h2>
                    {/* Caption Position Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-300">
                  Caption Layout
                </label>
                <div className="grid grid-cols-3 gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCaptionPosition('above');
                      setFormErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.textAbove;
                        return copy;
                      });
                    }}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      captionPosition === 'above' ? 'bg-zinc-800 text-lime-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    Above Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptionPosition('below');
                      setFormErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.textBelow;
                        return copy;
                      });
                    }}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      captionPosition === 'below' ? 'bg-zinc-800 text-lime-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    Below Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptionPosition('both');
                      setFormErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.textAbove;
                        delete copy.textBelow;
                        return copy;
                      });
                    }}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      captionPosition === 'both' ? 'bg-zinc-800 text-lime-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Text Above Input */}
              {(captionPosition === 'above' || captionPosition === 'both') && (
                <div className="space-y-1.5" id="err-textAbove">
                  <div className="flex items-center justify-between">
                    <label htmlFor="textAbove" className="block text-sm font-bold text-zinc-300">
                      Caption Above (Top text)
                    </label>
                    <span className={`text-[11px] font-mono ${textAbove.length > 100 ? 'text-rose-400' : 'text-zinc-500'}`}>
                      {textAbove.length}/100 chars
                    </span>
                  </div>
                  <input
                    id="textAbove"
                    type="text"
                    maxLength={100}
                    required
                    placeholder="ME:"
                    value={textAbove}
                    onChange={(e) => {
                      setTextAbove(e.target.value);
                      if (formErrors.textAbove) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.textAbove;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.textAbove ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-600 transition-colors`}
                  />
                  {formErrors.textAbove && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.textAbove}
                    </p>
                  )}
                </div>
              )}

              {/* Text Below Input */}
              {(captionPosition === 'below' || captionPosition === 'both') && (
                <div className="space-y-1.5" id="err-textBelow">
                  <div className="flex items-center justify-between">
                    <label htmlFor="textBelow" className="block text-sm font-bold text-zinc-300">
                      Caption Below (Bottom text)
                    </label>
                    <span className={`text-[11px] font-mono ${textBelow.length > 100 ? 'text-rose-400' : 'text-zinc-500'}`}>
                      {textBelow.length}/100 chars
                    </span>
                  </div>
                  <input
                    id="textBelow"
                    type="text"
                    maxLength={100}
                    required
                    placeholder="When the backend compiles on the first try..."
                    value={textBelow}
                    onChange={(e) => {
                      setTextBelow(e.target.value);
                      if (formErrors.textBelow) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.textBelow;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.textBelow ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-600 transition-colors`}
                  />
                  {formErrors.textBelow && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.textBelow}
                    </p>
                  )}
                </div>
              )}

              {/* Caption Customizations Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Color Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-300">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { hex: '#ffffff', name: 'White' },
                      { hex: '#000000', name: 'Black' },
                      { hex: '#facc15', name: 'Yellow' },
                      { hex: '#a3e635', name: 'Lime' },
                      { hex: '#22d3ee', name: 'Cyan' },
                      { hex: '#f87171', name: 'Red' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setTextColor(col.hex)}
                        className={`w-8 h-8 rounded-full border transition-transform relative ${
                          textColor === col.hex ? 'scale-110 border-lime-400 ring-2 ring-lime-400/20' : 'border-zinc-850 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {textColor === col.hex && (
                          <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${col.hex === '#ffffff' || col.hex === '#facc15' || col.hex === '#a3e635' || col.hex === '#22d3ee' || col.hex === '#f87171' ? 'text-zinc-950' : 'text-zinc-50'}`}>
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                    {/* Custom Color Input */}
                    <div className="relative w-8 h-8 rounded-full border border-zinc-800 overflow-hidden hover:scale-105 transition-transform flex items-center justify-center bg-zinc-900" title="Custom Color">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-zinc-400">+</span>
                    </div>
                  </div>
                </div>

                {/* Text Size Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-zinc-300">
                      Font Size
                    </label>
                    <span className="text-xs font-mono text-lime-400 font-extrabold">
                      {textSize}px
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTextSize((prev) => Math.max(12, prev - 2))}
                      className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-zinc-50 flex items-center justify-center font-extrabold text-sm select-none transition-all active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={12}
                      max={48}
                      step={1}
                      value={textSize}
                      onChange={(e) => setTextSize(parseInt(e.target.value))}
                      className="flex-1 accent-lime-400 bg-zinc-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setTextSize((prev) => Math.min(48, prev + 2))}
                      className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-zinc-50 flex items-center justify-center font-extrabold text-sm select-none transition-all active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Drag Position Controls Reset */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-850 rounded-2xl">
                <span className="text-xs text-zinc-400 font-mono">
                  💡 Hint: Drag text inside the live preview window to place it anywhere, or pull its edges to resize!
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTopAbove(15);
                    setLeftAbove(50);
                    setTopBelow(85);
                    setLeftBelow(50);
                    setWidthAbove(90);
                    setWidthBelow(90);
                  }}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-extrabold text-lime-400 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all uppercase tracking-wider cursor-pointer active:scale-95"
                >
                  Reset Layout
                </button>
              </div>

              {/* Image Source Selection */}
              <div className="space-y-3" id="err-meme">
                <label className="block text-sm font-bold text-zinc-300">
                  Meme Image Source
                </label>
                <>
                    {/* Source Selection Tabs */}
                    <div className="grid grid-cols-2 gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setImageSource('upload')}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          imageSource === 'upload' ? 'bg-zinc-800 text-lime-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-300'
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImageSource('template')}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          imageSource === 'template' ? 'bg-zinc-800 text-lime-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-300'
                        }`}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Templates</span>
                      </button>
                    </div>

                    {/* Custom Upload Form */}
                    {imageSource === 'upload' && (
                      <div 
                        onClick={() => memeInputRef.current?.click()}
                        className={`border-2 border-dashed ${formErrors.meme ? 'border-rose-500/50 bg-rose-950/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20'} rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-zinc-950/40`}
                      >
                        <input
                          ref={memeInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleMemeChange}
                          className="hidden"
                        />
                        <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2 stroke-[1.5]" />
                        <p className="text-sm font-semibold text-zinc-300">
                          {memeFile ? memeFile.name : 'Select or drag custom meme'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 font-mono">
                          PNG, JPG, or WEBP up to 8MB (Compressed automatically)
                        </p>
                      </div>
                    )}

                    {/* Template Selection Grid */}
                    {imageSource === 'template' && (
                      <div className="space-y-3">
                        {loadingTemplates ? (
                          <div className="grid grid-cols-3 gap-3 animate-pulse">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="aspect-square bg-zinc-900 rounded-xl" />
                            ))}
                          </div>
                        ) : templates.length === 0 ? (
                          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center text-zinc-500 text-xs font-mono">
                            No templates found in database.
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            {templates.map((tpl) => {
                              const isSelected = selectedTemplate?.id === tpl.id;
                              return (
                                <button
                                  key={tpl.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTemplate(tpl);
                                    setFormErrors((prev) => {
                                      const copy = { ...prev };
                                      delete copy.meme;
                                      return copy;
                                    });
                                  }}
                                  className={`group relative aspect-square bg-zinc-950 rounded-xl overflow-hidden border-2 transition-all ${
                                    isSelected ? 'border-lime-400 ring-2 ring-lime-400/20' : 'border-zinc-850 hover:border-zinc-700'
                                  }`}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={resolveStorageUrl(tpl.thumbnail_url)}
                                    alt={tpl.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-zinc-950/80 p-1.5 text-[10px] text-zinc-300 truncate font-mono text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {tpl.name}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}


                    
                    {formErrors.meme && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.meme}
                      </p>
                    )}
                  </>
              </div>
            </div>

            {/* Section 2: Product Specifications */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-zinc-800 pb-3 flex items-center gap-2 text-zinc-200">
                <Tag className="h-5 w-5 text-lime-400" />
                <span>Specs (Hidden Underneath)</span>
              </h2>

              {/* Product Logo Upload */}
              <div className="space-y-2" id="err-productLogo">
                <label className="block text-sm font-bold text-zinc-300">
                  Product Logo
                </label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className={`flex-1 border-2 border-dashed ${formErrors.productLogo ? 'border-rose-500/50 bg-rose-950/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20'} rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-zinc-950/40`}
                  >
                    <input
                      ref={logoInputRef}
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Upload className="h-5 w-5 text-zinc-500 mx-auto mb-1 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-zinc-305">
                      {productLogoFile ? productLogoFile.name : 'Upload logo image (1:1 aspect recommended)'}
                    </p>
                  </div>
                  {productLogoPreview && (
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-zinc-850 shrink-0 bg-zinc-950 shadow-md">
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
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.productLogo}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1.5" id="err-productName">
                  <label htmlFor="productName" className="block text-sm font-bold text-zinc-300">
                    Product Name
                  </label>
                  <input
                    id="productName"
                    type="text"
                    required
                    placeholder="MemeLaunch"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.productName ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors`}
                  />
                  {formErrors.productName && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.productName}
                    </p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1.5" id="err-category">
                  <label htmlFor="category" className="block text-sm font-bold text-zinc-300">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.category ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors cursor-pointer appearance-none`}
                    >
                      <option value="" disabled className="text-zinc-600">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-zinc-950 text-zinc-150">
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
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Product URL */}
              <div className="space-y-1.5" id="err-productUrl">
                <label htmlFor="productUrl" className="block text-sm font-bold text-zinc-300">
                  Product Link (URL)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    id="productUrl"
                    type="url"
                    required
                    placeholder="https://memelaunch.dev"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-zinc-950 border ${formErrors.productUrl ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors`}
                  />
                </div>
                {formErrors.productUrl && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.productUrl}
                  </p>
                )}
              </div>

              {/* Product Description */}
              <div className="space-y-1.5" id="err-productDescription">
                <div className="flex items-center justify-between">
                  <label htmlFor="productDescription" className="block text-sm font-bold text-zinc-300">
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
                  className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.productDescription ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors resize-none`}
                />
                {formErrors.productDescription && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.productDescription}
                  </p>
                )}
              </div>

              {/* Pricing selector */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-zinc-300">
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
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-zinc-850/50 border-lime-400 text-lime-400 font-extrabold shadow-[0_0_15px_rgba(163,230,53,0.1)]' 
                            : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
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

            {/* Section 3: Verified Screenshots (2-3) */}
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-200">
                  <Upload className="h-5 w-5 text-lime-400" />
                  <span>Product Screenshots</span>
                </h2>
                <span className="text-xs font-mono text-zinc-500">
                  {`${screenshotPreviews.length}/3 uploaded (2 required)`}
                </span>
              </div>

              {/* Previews & Drop Area */}
              <div className="space-y-4" id="err-screenshots">
                {screenshotPreviews.length < 3 && (
                  <div 
                    onClick={() => screenshotInputRef.current?.click()}
                    className={`border-2 border-dashed ${formErrors.screenshots ? 'border-rose-500/50 bg-rose-950/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20'} rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-zinc-950/40`}
                  >
                    <input
                      ref={screenshotInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                    <Upload className="h-6 w-6 text-zinc-500 mx-auto mb-2 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-zinc-300">
                      Upload product screenshots
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 font-mono">
                      Please select 2 or 3 screenshots showing the real app.
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
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.screenshots}
                  </p>
                )}
              </div>
            </div>

            {/* Launch CTA Button */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:shadow-[0_0_35px_rgba(163,230,53,0.3)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Launch</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
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
    </div>
  );
}
