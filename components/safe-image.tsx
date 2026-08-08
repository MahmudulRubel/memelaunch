'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { resolveStorageUrl } from '@/lib/insforge';

export type FallbackType = 'meme' | 'avatar' | 'logo' | 'general';

const DEFAULT_FALLBACKS: Record<FallbackType, string> = {
  meme: 'https://i.imgflip.com/30b1gx.jpg',
  avatar:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2327272a"/><circle cx="50" cy="40" r="20" fill="%2371717a"/><path d="M20 90 C20 70, 80 70, 80 90" fill="%2371717a"/></svg>',
  logo:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%2327272a"/><text x="50" y="58" font-family="sans-serif" font-size="32" font-weight="bold" fill="%23ffe600" text-anchor="middle">ML</text></svg>',
  general:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2318181b"/><text x="50" y="55" font-family="sans-serif" font-size="14" fill="%2371717a" text-anchor="middle">No Image</text></svg>',
};

export interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string | null | undefined;
  fallbackSrc?: string;
  fallbackType?: FallbackType;
}

/**
 * SafeImage wraps Next.js `<Image />` with automatic storage URL resolution,
 * unoptimized SVG detection, and stateful fallback protection against 404/broken URLs.
 */
export function SafeImage({
  src,
  fallbackSrc,
  fallbackType = 'general',
  alt,
  unoptimized,
  ...props
}: SafeImageProps) {
  const defaultFallback = fallbackSrc || DEFAULT_FALLBACKS[fallbackType];
  const initialResolved = resolveStorageUrl(src) || defaultFallback;
  const [imgSrc, setImgSrc] = useState<string>(initialResolved);

  useEffect(() => {
    const resolved = resolveStorageUrl(src);
    setImgSrc(resolved || defaultFallback);
  }, [src, defaultFallback]);

  const isSvg =
    typeof imgSrc === 'string' &&
    (imgSrc.endsWith('.svg') || imgSrc.startsWith('data:image/svg'));

  return (
    <Image
      {...props}
      src={imgSrc || defaultFallback}
      alt={alt || ''}
      unoptimized={unoptimized ?? isSvg}
      onError={() => {
        if (imgSrc !== defaultFallback) {
          setImgSrc(defaultFallback);
        }
      }}
    />
  );
}

export default SafeImage;
