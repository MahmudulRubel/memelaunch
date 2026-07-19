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
});

