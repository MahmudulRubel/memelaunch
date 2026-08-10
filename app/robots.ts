import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/signup', '/forgot-password', '/reset-password', '/launch'],
      },
      // Explicitly welcome AI Search & LLM Engines for AEO optimization
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Bytespider', 'CCBot'],
        allow: '/',
        disallow: ['/admin', '/launch'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.launchme.me'}/sitemap.xml`,
  };
}
