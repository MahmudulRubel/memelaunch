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

/**
 * Returns a deterministic gradient background style for user avatar fallbacks.
 */
export function getAvatarGradient(nameOrId: string | null | undefined): string {
  if (!nameOrId) return 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white';
  const charCode = nameOrId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white',
    'bg-gradient-to-tr from-lime-400 via-emerald-500 to-teal-600 text-zinc-950',
    'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 text-white',
    'bg-gradient-to-tr from-fuchsia-400 via-pink-500 to-rose-600 text-white',
    'bg-gradient-to-tr from-[#ffe600] via-amber-400 to-orange-500 text-zinc-950',
    'bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 text-zinc-950',
    'bg-gradient-to-tr from-violet-400 via-purple-500 to-pink-600 text-white',
  ];
  return gradients[charCode % gradients.length];
}

/**
 * Returns a category badge style with distinct theme color accenting.
 */
export function getCategoryBadgeStyle(category: string | null | undefined): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('saas')) return 'bg-amber-400/10 text-amber-400 border-amber-400/40';
  if (cat.includes('ai') || cat.includes('ml')) return 'bg-cyan-400/10 text-cyan-400 border-cyan-400/40';
  if (cat.includes('dev') || cat.includes('code')) return 'bg-lime-400/10 text-lime-400 border-lime-400/40';
  if (cat.includes('market') || cat.includes('sales')) return 'bg-pink-400/10 text-pink-400 border-pink-400/40';
  if (cat.includes('prod') || cat.includes('tool')) return 'bg-purple-400/10 text-purple-400 border-purple-400/40';
  return 'bg-[#ffe600]/10 text-[#ffe600] border-[#ffe600]/40';
}



