'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { resolveStorageUrl } from '@/lib/insforge';

export type FallbackType = 'meme' | 'avatar' | 'logo' | 'general';

const REAL_MEME_FALLBACK = '/drake.png';
const REAL_AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
const REAL_LOGO_FALLBACK = '/logo-icon.png';
const REAL_GENERAL_FALLBACK = '/drake.png';

export const DEFAULT_FALLBACKS: Record<FallbackType, string> = {
  meme: REAL_MEME_FALLBACK,
  avatar: REAL_AVATAR_FALLBACK,
  logo: REAL_LOGO_FALLBACK,
  general: REAL_GENERAL_FALLBACK,
};

export interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string | null | undefined;
  fallbackSrc?: string;
  fallbackType?: FallbackType;
  onImageError?: () => void;
}

/**
 * SafeImage wraps Next.js `<Image />` with automatic storage URL resolution,
 * unoptimized fallback for remote hosts, and multi-stage recovery using REAL photos.
 */
export function SafeImage({
  src,
  fallbackSrc,
  fallbackType = 'general',
  alt,
  unoptimized,
  onImageError,
  ...props
}: SafeImageProps) {
  const guaranteedFallback = DEFAULT_FALLBACKS[fallbackType] || REAL_GENERAL_FALLBACK;
  const primaryResolved = resolveStorageUrl(src);

  const getInitialState = () => {
    if (primaryResolved) {
      return { url: primaryResolved, stage: 0 };
    }
    if (fallbackSrc) {
      return { url: fallbackSrc, stage: 1 };
    }
    return { url: guaranteedFallback, stage: 2 };
  };

  const [{ url: imgSrc, stage }, setImgState] = useState(getInitialState);

  useEffect(() => {
    setImgState(getInitialState());
  }, [src, fallbackSrc, guaranteedFallback]);

  const isSvg =
    typeof imgSrc === 'string' &&
    (imgSrc.endsWith('.svg') || imgSrc.startsWith('data:image/svg'));

  const isExternalRemote =
    typeof imgSrc === 'string' &&
    (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'));

  // Always enable unoptimized for external URLs or fallbacks so browser loads real photo directly
  const isUnoptimized = unoptimized ?? (stage > 0 || isSvg || isExternalRemote);

  const handleError = () => {
    onImageError?.();
    if (stage === 0) {
      if (fallbackSrc && fallbackSrc !== imgSrc) {
        setImgState({ url: fallbackSrc, stage: 1 });
      } else {
        setImgState({ url: guaranteedFallback, stage: 2 });
      }
    } else if (stage === 1) {
      setImgState({ url: guaranteedFallback, stage: 2 });
    } else if (stage === 2 && imgSrc !== REAL_GENERAL_FALLBACK) {
      setImgState({ url: REAL_GENERAL_FALLBACK, stage: 3 });
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc || guaranteedFallback}
      alt={alt || ''}
      unoptimized={isUnoptimized}
      onError={handleError}
    />
  );
}

export default SafeImage;


