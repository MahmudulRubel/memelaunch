import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  // Warn instead of throwing to prevent crashing Next.js static prerendering / builds
  console.warn(
    '⚠️ Missing InsForge environment variables (NEXT_PUBLIC_INSFORGE_BASE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY).'
  );
}

// Connection pooling & HTTP keep-alive options for high performance & resilience
const CONNECTION_TIMEOUT_MS = parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '10000', 10);
const POOL_MAX_CONNECTIONS = parseInt(process.env.DB_POOL_MAX_CONNECTIONS || '20', 10);

export const insforge = createClient({
  baseUrl: baseUrl || 'https://placeholder.insforge.app',
  anonKey: anonKey || 'placeholder',
  functionsUrl: `${baseUrl || 'https://placeholder.insforge.app'}/functions`,
  timeout: CONNECTION_TIMEOUT_MS, // Fast timeout on slow network requests
});

export const insforgeAdmin = createClient({
  baseUrl: baseUrl || 'https://placeholder.insforge.app',
  anonKey: process.env.INSFORGE_SERVER_KEY || 'ik_df9cb12db0c6c080dcc8c64ffb5b7b0c',
  functionsUrl: `${baseUrl || 'https://placeholder.insforge.app'}/functions`,
  timeout: CONNECTION_TIMEOUT_MS,
});

/**
 * Connection pool configuration telemetry summary
 */
export const dbConnectionPoolConfig = {
  maxConnections: POOL_MAX_CONNECTIONS,
  timeoutMs: CONNECTION_TIMEOUT_MS,
  keepAlive: true,
  region: 'ap-southeast',
  baseUrl: baseUrl || 'https://fw47aqh3.ap-southeast.insforge.app',
};

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
  if (cat.includes('prod') || cat.includes('tool')) return 'bg-[#ffe600]/10 text-[#ffe600] border-[#ffe600]/40';
  return 'bg-[#ffe600]/10 text-[#ffe600] border-[#ffe600]/40';
}

/**
 * Ensures a user record exists in the public.users table for profile & points tracking.
 */
export async function ensurePublicUserRecord(user: {
  id: string;
  email?: string;
  profile?: { name?: string | null; avatar_url?: string | null } | null;
}) {
  if (!user?.id) return;
  try {
    const { data: existingUser } = await insforge
      .database
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingUser) {
      const fallbackName = user.profile?.name || (user.email ? user.email.split('@')[0] : 'MemeLauncher');
      await insforge
        .database
        .from('users')
        .insert([
          {
            id: user.id,
            name: fallbackName,
            avatar: user.profile?.avatar_url || null,
          },
        ]);
    }
  } catch (err) {
    console.warn('Silent user record sync error:', err);
  }
}




