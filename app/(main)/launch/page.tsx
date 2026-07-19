'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { insforge } from '@/lib/insforge';
import { compressImage } from '@/lib/image';
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
  Repeat
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  thumbnail_url: string;
  active_week: number;
  usage_count: number;
}

const launchFormSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  pricing: z.enum(['free', 'paid', 'freemium']),
  productUrl: z.string().url('Please enter a valid product URL (e.g. https://example.com)'),
  caption: z.string().min(3, 'Caption must be at least 3 characters').max(100, 'Caption must be 100 characters or less'),
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
  const [caption, setCaption] = useState('');

  // Image states
  const [imageSource, setImageSource] = useState<'upload' | 'template' | 'ai'>('upload');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
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

  // Remix mechanics
  const searchParams = useSearchParams();
  const remixParentId = searchParams.get('remix');
  const [parentLaunch, setParentLaunch] = useState<any | null>(null);
  const [loadingParent, setLoadingParent] = useState(false);

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

  // Fetch parent launch for remix if applicable
  useEffect(() => {
    if (!remixParentId) return;

    async function fetchParentLaunch() {
      setLoadingParent(true);
      try {
        const { data: parentData, error: parentErr } = await insforge.database
          .from('launches')
          .select('*, users(name)')
          .eq('id', remixParentId)
          .single();

        if (!parentErr && parentData) {
          setParentLaunch(parentData);
          setProductName(parentData.product_name || '');
          setCategory(parentData.category || '');
          setPricing(parentData.pricing || 'free');
          setProductUrl(parentData.product_url || '');

          if (parentData.template_id && templates.length > 0) {
            const matchedTemplate = templates.find(t => t.id === parentData.template_id);
            if (matchedTemplate) setSelectedTemplate(matchedTemplate);
          }

          // Fetch screenshots
          const { data: screensData, error: screensErr } = await insforge.database
            .from('launch_screenshots')
            .select('*')
            .eq('launch_id', remixParentId)
            .order('order', { ascending: true });

          if (!screensErr && screensData) {
            const urls = screensData.map((s: any) => s.image_url);
            setScreenshotPreviews(urls);
            setScreenshotFiles(urls.map(() => null));
          }
        }
      } catch (err) {
        console.error('Failed to load parent launch for remix:', err);
      } finally {
        setLoadingParent(false);
      }
    }

    if (!loadingTemplates) {
      fetchParentLaunch();
    }
  }, [remixParentId, loadingTemplates, templates]);

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
      screenshotPreviews.forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [memePreview, screenshotPreviews]);

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

  // Handle AI image generation
  const handleGenerateImage = async () => {
    if (!aiPrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.meme;
      return copy;
    });

    try {
      const image = await insforge.ai.images.generate({
        model: 'google/gemini-3-pro-image-preview',
        prompt: aiPrompt.trim(),
      });

      if (!image?.data?.[0]?.b64_json) {
        if (image?.data?.[0]?.content) {
          throw new Error(image.data[0].content);
        }
        throw new Error('Image generation response is missing image data.');
      }

      const b64Json = image.data[0].b64_json;
      let file: File;

      if (b64Json.startsWith('http://') || b64Json.startsWith('https://')) {
        const response = await fetch(b64Json);
        const blob = await response.blob();
        file = new File([blob], 'ai-meme.png', { type: blob.type || 'image/png' });
      } else {
        // Clean base64 string of whitespace characters
        const cleanB64 = b64Json.replace(/\s/g, '');
        // Convert base64 to Blob & File
        const byteCharacters = atob(cleanB64);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: 'image/png' });
        file = new File([blob], 'ai-meme.png', { type: 'image/png' });
      }

      // Revoke old blob URL if exists
      if (memePreview && memePreview.startsWith('blob:')) {
        URL.revokeObjectURL(memePreview);
      }

      setMemeFile(file);
      setMemePreview(URL.createObjectURL(file));

    } catch (err: any) {
      console.error('Image generation error:', err);
      setFormErrors((prev) => ({
        ...prev,
        meme: err.message || 'Failed to generate image. Please try again.',
      }));
    } finally {
      setIsGeneratingImage(false);
    }
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
      caption,
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

    // 2. Custom validation for files
    if (!remixParentId) {
      if (imageSource === 'upload' && !memeFile) {
        errors.meme = 'Please upload a meme image';
      }
      if (imageSource === 'ai' && !memeFile) {
        errors.meme = 'Please generate a meme image using AI';
      }
      if (imageSource === 'template' && !selectedTemplate) {
        errors.meme = 'Please select a template';
      }
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

    setIsSubmitting(true);

    try {
      // Step A: Compress and Upload Meme Image
      let memeImageUrl = '';
      if (remixParentId && parentLaunch) {
        memeImageUrl = parentLaunch.meme_image_url;
      } else if ((imageSource === 'upload' || imageSource === 'ai') && memeFile) {
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

      // Step C: Insert into Launches table
      setStatusMessage('Publishing launch details...');
      const { data: launchData, error: launchError } = await insforge.database
        .from('launches')
        .insert([
          {
            user_id: user.id,
            meme_image_url: memeImageUrl,
            caption: caption.trim(),
            product_name: productName.trim(),
            product_url: productUrl.trim(),
            pricing: pricing,
            category: category.trim(),
            template_id: remixParentId && parentLaunch
              ? parentLaunch.template_id
              : (imageSource === 'template' && selectedTemplate ? selectedTemplate.id : null),
          },
        ])
        .select();

      if (launchError || !launchData || launchData.length === 0) {
        throw new Error(launchError?.message || 'Failed to create product launch row.');
      }

      const launchId = launchData[0].id;

      // Step C-2: Link Remix in database (if applicable)
      if (remixParentId) {
        setStatusMessage('Linking remix to parent launch...');
        const { error: remixLinkError } = await insforge.database
          .from('remixes')
          .insert([
            {
              original_launch_id: remixParentId,
              remix_launch_id: launchId,
            },
          ]);

        if (remixLinkError) {
          throw new Error(remixLinkError.message || 'Failed to link remix in database.');
        }
      }

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
      if (!remixParentId && imageSource === 'template' && selectedTemplate) {
        await insforge.database
          .from('templates')
          .update({ usage_count: (selectedTemplate.usage_count || 0) + 1 })
          .eq('id', selectedTemplate.id);
      }

      setStatusMessage('');
      setSuccessMessage(
        remixParentId
          ? '🎉 Meme remixed successfully! It will go live after admin approval. Redirecting back...'
          : '🎉 Product launched successfully! It will go live after admin approval. Redirecting back...'
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
  const memePreviewSource = remixParentId && parentLaunch
    ? parentLaunch.meme_image_url
    : imageSource === 'template' && selectedTemplate 
      ? selectedTemplate.thumbnail_url 
      : memePreview;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          {remixParentId && parentLaunch ? (
            <>
              <h1 className="font-impact text-3xl md:text-5xl uppercase tracking-tight text-zinc-50">
                REMIX MEME FOR <span className="text-cyan-400">{parentLaunch.product_name}</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                You are posting a linked remix to @{parentLaunch.users?.name || 'founder'}&apos;s product launch.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-impact text-3xl md:text-5xl uppercase tracking-tight text-zinc-50">
                LAUNCH <span className="text-lime-400">YOUR PRODUCT</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Publish a meme hook, and pack the specs page underneath. Ready in 2 minutes.
              </p>
            </>
          )}
        </div>
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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: LIVE CARD PREVIEW (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">
                Live Meme Preview
              </span>
              
              {/* Meme Card Mockup */}
              <div className="relative flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Aspect ratio block for image preview */}
                <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800/60">
                  <div className="absolute inset-0 bg-radial-gradient from-lime-400/5 to-transparent opacity-40 pointer-events-none" />
                  
                  {memePreviewSource ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={memePreviewSource}
                      alt="Meme preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-8 text-center space-y-2 text-zinc-600">
                      <ImageIcon className="h-12 w-12 mx-auto stroke-[1.2]" />
                      <p className="font-mono text-xs">Meme preview will appear here</p>
                    </div>
                  )}

                  {/* Watermark */}
                  <div className="absolute top-2 right-3 text-[9px] font-mono text-zinc-400/30 tracking-widest uppercase">
                    MEMELAUNCH
                  </div>

                  {/* Caption Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-4 pt-10 flex flex-col justify-end">
                    <p className="text-lg font-impact uppercase tracking-wider text-zinc-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center line-clamp-3 leading-snug">
                      {caption || 'YOUR MEME CAPTION HERE'}
                    </p>
                  </div>
                </div>

                {/* Details Bar Mockup */}
                <div className="p-4 bg-zinc-900/40 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-base text-zinc-100 truncate">
                      {productName || 'Product Name'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase font-bold tracking-wider">
                      {pricing}
                    </span>
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
            
            {remixParentId && parentLaunch && (
              <div className="p-4 bg-cyan-950/40 border border-cyan-800/50 rounded-2xl flex gap-3 text-cyan-400 text-sm">
                <Repeat className="h-5 w-5 shrink-0 text-cyan-400" />
                <div className="space-y-1">
                  <p className="font-bold">Meme Remix Mode</p>
                  <p className="text-xs text-cyan-350/90">
                    You are remixing the meme for <strong>{parentLaunch.product_name}</strong> launched by <strong>@{parentLaunch.users?.name || 'founder'}</strong>. Product details and screenshots are pre-populated and locked.
                  </p>
                </div>
              </div>
            )}
            
            {/* Section 1: Meme Content */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-zinc-800 pb-3 flex items-center gap-2 text-zinc-200">
                <Sparkles className="h-5 w-5 text-lime-400" />
                <span>Meme Setup</span>
              </h2>

              {/* Caption field */}
              <div className="space-y-1.5" id="err-caption">
                <div className="flex items-center justify-between">
                  <label htmlFor="caption" className="block text-sm font-bold text-zinc-300">
                    Meme Caption
                  </label>
                  <span className={`text-[11px] font-mono ${caption.length > 100 ? 'text-rose-400' : 'text-zinc-500'}`}>
                    {caption.length}/100 chars
                  </span>
                </div>
                <input
                  id="caption"
                  type="text"
                  maxLength={100}
                  required
                  placeholder="When the backend compiles on the first try..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.caption ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-600 transition-colors`}
                />
                {formErrors.caption && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.caption}
                  </p>
                )}
              </div>

              {/* Image Source Selection */}
              <div className="space-y-3" id="err-meme">
                <label className="block text-sm font-bold text-zinc-300">
                  {remixParentId ? 'Meme Background' : 'Meme Image Source'}
                </label>
                
                {remixParentId ? (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
                    {parentLaunch?.meme_image_url ? (
                      <div className="relative aspect-square w-32 bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={parentLaunch.meme_image_url}
                          alt="Inherited meme background"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Loader2 className="h-6 w-6 text-lime-400 animate-spin" />
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-300">Meme Background Inherited</p>
                      <p className="text-[11px] font-mono text-zinc-500">
                        Remixes inherit the original meme layout. Type your own caption above!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Source Selection Tabs */}
                    <div className="grid grid-cols-3 gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
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

                      <button
                        type="button"
                        onClick={() => {
                          setImageSource('ai');
                          setFormErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.meme;
                            return copy;
                          });
                        }}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          imageSource === 'ai' ? 'bg-zinc-800 text-lime-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-300'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Generate</span>
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
                                    src={tpl.thumbnail_url}
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

                    {/* AI Generate Form */}
                    {imageSource === 'ai' && (
                      <div className="space-y-4 p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label htmlFor="ai-prompt" className="block text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
                              AI Image Prompt
                            </label>
                            <span className="text-[10px] font-mono text-zinc-500">
                              Model: Gemini 3 Pro
                            </span>
                          </div>
                          <textarea
                            id="ai-prompt"
                            rows={3}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., A developer crying in front of a computer screen with 'Out of Memory' error, cartoon style"
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors resize-none"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isGeneratingImage || !aiPrompt.trim()}
                          onClick={handleGenerateImage}
                          className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(163,230,53,0.1)] hover:shadow-[0_0_25px_rgba(163,230,53,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Generating Meme Image...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Generate Image</span>
                            </>
                          )}
                        </button>

                        {memePreview && (
                          <div className="text-center pt-2 border-t border-zinc-900">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Meme image generated successfully!</span>
                            </span>
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
                )}
              </div>
            </div>

            {/* Section 2: Product Specifications */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-zinc-800 pb-3 flex items-center gap-2 text-zinc-200">
                <Tag className="h-5 w-5 text-lime-400" />
                <span>Specs (Hidden Underneath)</span>
              </h2>

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
                    disabled={!!remixParentId}
                    placeholder="MemeLaunch"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.productName ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                  {formErrors.productName && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.productName}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1.5" id="err-category">
                  <label htmlFor="category" className="block text-sm font-bold text-zinc-300">
                    Category Tag
                  </label>
                  <input
                    id="category"
                    type="text"
                    required
                    disabled={!!remixParentId}
                    placeholder="SaaS / Developer Tools"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.category ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
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
                    disabled={!!remixParentId}
                    placeholder="https://memelaunch.dev"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-zinc-950 border ${formErrors.productUrl ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                </div>
                {formErrors.productUrl && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.productUrl}
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
                        disabled={!!remixParentId}
                        onClick={() => !remixParentId && setPricing(item.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
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
                  {remixParentId ? `${screenshotPreviews.length}/3 cloned` : `${screenshotPreviews.length}/3 uploaded (2 required)`}
                </span>
              </div>

              {/* Previews & Drop Area */}
              <div className="space-y-4" id="err-screenshots">
                {/* Upload Picker Trigger (if less than 3 and not remix) */}
                {!remixParentId && screenshotPreviews.length < 3 && (
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
                        {!remixParentId && (
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-zinc-950/80 hover:bg-rose-950/90 text-zinc-400 hover:text-rose-400 rounded-md border border-zinc-800 hover:border-rose-800/50 opacity-0 group-hover:opacity-100 transition-all shadow"
                            title="Delete screenshot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
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
                className={`px-6 py-3 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  remixParentId
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_35px_rgba(34,211,238,0.3)]'
                    : 'bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:shadow-[0_0_35px_rgba(163,230,53,0.3)]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
                    <span>{remixParentId ? 'Remixing...' : 'Launching...'}</span>
                  </>
                ) : (
                  <>
                    <span>{remixParentId ? 'Publish Remix' : 'Publish Launch'}</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}
