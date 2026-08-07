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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* TOP FULL-WIDTH SECTION: PROFESSIONAL MEME STUDIO */}
          <div className="w-full space-y-2">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">
              Professional Meme Studio
            </span>
            
            <MemeStudio
              ref={memeStudioRef}
              imageUrl={memePreviewSource ? resolveStorageUrl(memePreviewSource) : null}
              productLogoUrl={productLogoPreview}
              textAbove={textAbove}
              textBelow={textBelow}
              templates={templates}
              selectedTemplateId={selectedTemplate?.id || null}
              onSelectTemplate={(tmpl) => {
                setSelectedTemplate(tmpl);
                setImageSource('template');
              }}
              onUploadCustomImage={(file) => {
                setMemeFile(file);
                setImageSource('upload');
                setMemePreview(URL.createObjectURL(file));
              }}
              onTextAboveChange={setTextAbove}
              onTextBelowChange={setTextBelow}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
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
                {/* Meme Thumbnail Header */}
                <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden border-b border-zinc-800/80 group">
                  {memePreviewSource ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveStorageUrl(memePreviewSource)}
                        alt="Meme Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Top Text Caption Overlay */}
                      {textAbove && (
                        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-transparent p-2.5 pb-6 flex flex-col justify-start z-10 pointer-events-none">
                          <p className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-white text-base md:text-lg">
                            {textAbove}
                          </p>
                        </div>
                      )}

                      {/* Bottom Text Caption Overlay */}
                      {textBelow && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/40 to-transparent p-2.5 pt-6 flex flex-col justify-end z-10 pointer-events-none">
                          <p className="font-impact uppercase tracking-wider text-center line-clamp-2 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-white text-base md:text-lg">
                            {textBelow}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900">
                      <Sparkles className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
                      <p className="text-xs font-mono text-zinc-500">Meme Canvas Live Preview</p>
                      <p className="text-[11px] text-zinc-600 mt-1">Design your meme in the studio above</p>
                    </div>
                  )}

                  {/* Strategy Badge Overlay */}
                  <div className="absolute top-3 right-3 z-20">
                    {preferredCycle === 'current' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-lg">
                        🏆 Current Week Entry
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 backdrop-blur-md shadow-lg">
                        🛡️ Next Week Entry
                      </span>
                    )}
                  </div>
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

              {/* Error display on submit failure */}
              {formErrors.submit && (
                <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-2xl flex gap-3 text-rose-400 text-sm shadow-xl">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold">Launch Failed</p>
                    <p className="text-xs text-rose-300/90">{formErrors.submit}</p>
                  </div>
                </div>
              )}

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
              
              {/* World Cup Strategy Selector */}
              <div className="space-y-4 p-5 bg-gradient-to-br from-amber-500/10 via-zinc-950 to-amber-500/5 border border-amber-500/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <label className="text-sm font-extrabold text-white">
                    World Cup Entry Strategy
                  </label>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold ml-auto">
                    48h Race Choice
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Choose how your product enters the weekly Meme World Cup qualification race:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPreferredCycle('current')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      preferredCycle === 'current'
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                      <span>🚀</span>
                      <span>I&apos;m Confident! (This Week)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                      Enter this week&apos;s race immediately. Great if you have an audience ready to vote!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredCycle('next')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      preferredCycle === 'next'
                        ? 'bg-blue-500/20 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] font-bold'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
                      <span>🛡️</span>
                      <span>Safe Play (Next Week)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                      Get a full 7 days on the main feed to accumulate reactions naturally for next week.
                    </p>
                  </button>
                </div>
              </div>

              {/* Product Specifications Section */}
              <div className="space-y-6">
                <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold flex items-center gap-2 text-zinc-100">
                    <Tag className="h-5 w-5 text-lime-400" />
                    <span>Product Details</span>
                  </h2>
                  <span className="text-[11px] font-mono text-zinc-500">Public Product Info</span>
                </div>

                {/* Product Logo Upload */}
                <div className="space-y-2" id="err-productLogo">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Product Logo
                  </label>
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
                        {productLogoFile ? productLogoFile.name : 'Upload logo image (1:1 square recommended)'}
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

              {/* Product Screenshots Section (2-3) */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold flex items-center gap-2 text-zinc-100">
                    <Upload className="h-5 w-5 text-lime-400" />
                    <span>Product Screenshots</span>
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

              {/* Launch CTA Action Bar */}
              <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                <div className="text-xs font-mono text-zinc-500">
                  <span>Entry Fee: </span>
                  <span className="text-lime-400 font-bold">-15 Points</span>
                </div>

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
                      <span>Launch Product & Enter Race</span>
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
    </div>
  );
}
