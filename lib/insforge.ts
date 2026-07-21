import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  // Warn instead of throwing to prevent crashing Next.js static prerendering / builds
  console.warn(
    '⚠️ Missing InsForge environment variables (NEXT_PUBLIC_INSFORGE_BASE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY).'
  );
}

export const insforge = createClient({
  baseUrl: baseUrl || 'https://placeholder.insforge.app',
  anonKey: anonKey || 'placeholder',
  functionsUrl: `${baseUrl || 'https://placeholder.insforge.app'}/functions`,
  timeout: 10000, // Fail fast on slow networks/timeouts
});

/**
 * Utility to resolve InsForge storage URLs to our local Next.js API proxy,
 * bypassing CloudFront CDN 403 Forbidden errors.
 */
export function resolveStorageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('/api/storage/buckets/')) {
    const match = url.match(/\/api\/storage\/buckets\/([^/]+)\/objects\/(.+)$/);
    if (match) {
      const bucket = match[1];
      const keyWithQuery = match[2];
      const key = keyWithQuery.split('?')[0];
      return `/api/storage/${bucket}/${key}`;
    }
  }
  return url;
}


