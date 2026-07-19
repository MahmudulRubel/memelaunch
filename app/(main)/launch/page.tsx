'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Loader2
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
  const [imageSource, setImageSource] = useState<'upload' | 'template'>('upload');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Custom Meme upload
  const [memeFile, setMemeFile] = useState<File | null>(null);
  const [memePreview, setMemePreview] = useState<string | null>(null);
  const memeInputRef = useRef<HTMLInputElement>(null);

  // Screenshots upload (2-3)
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Submission / Loading states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    if (imageSource === 'upload' && !memeFile) {
      errors.meme = 'Please upload a meme image';
    }
    if (imageSource === 'template' && !selectedTemplate) {
      errors.meme = 'Please select a template';
    }

    if (screenshotFiles.length < 2) {
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
      if (imageSource === 'upload' && memeFile) {
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
      for (let i = 0; i < screenshotFiles.length; i++) {
        const file = screenshotFiles[i];
        setStatusMessage(`Compressing screenshot ${i + 1} of ${screenshotFiles.length}...`);
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
            template_id: imageSource === 'template' && selectedTemplate ? selectedTemplate.id : null,
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

      setStatusMessage('');
      setSuccessMessage('🎉 Product launched successfully! Redirecting back to feed...');

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
          <h1 className="font-impact text-3xl md:text-5xl uppercase tracking-tight text-zinc-50">
            LAUNCH <span className="text-lime-400">YOUR PRODUCT</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Publish a meme hook, and pack the specs page underneath. Ready in 2 minutes.
          </p>
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
                  Meme Image Source
                </label>
                
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
                    disabled
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase text-zinc-600 cursor-not-allowed"
                    title="Coming soon in Unit 6!"
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
                
                {formErrors.meme && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.meme}
                  </p>
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

                {/* Category */}
                <div className="space-y-1.5" id="err-category">
                  <label htmlFor="category" className="block text-sm font-bold text-zinc-300">
                    Category Tag
                  </label>
                  <input
                    id="category"
                    type="text"
                    required
                    placeholder="SaaS / Developer Tools"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-zinc-950 border ${formErrors.category ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-650 transition-colors`}
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
                    placeholder="https://memelaunch.dev"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-zinc-950 border ${formErrors.productUrl ? 'border-rose-500/60' : 'border-zinc-800'} rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 placeholder-zinc-600 transition-colors`}
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
                  {screenshotFiles.length}/3 uploaded (2 required)
                </span>
              </div>

              {/* Previews & Drop Area */}
              <div className="space-y-4" id="err-screenshots">
                {/* Upload Picker Trigger (if less than 3) */}
                {screenshotFiles.length < 3 && (
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
                className="px-6 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(163,230,53,0.15)] hover:shadow-[0_0_35px_rgba(163,230,53,0.3)] active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
    </div>
  );
}
