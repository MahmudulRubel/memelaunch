import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.insforge.app https://*.ap-southeast.insforge.app https://*.unsplash.com https://*.imgflip.com https://imgflip.com https://i.imgflip.com https://*.googleusercontent.com https://avatars.githubusercontent.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.insforge.app https://*.ap-southeast.insforge.app https://*.sentry.io;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'posthog-js',
      '@insforge/sdk',
      'zod',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgflip.com',
      },
      {
        protocol: 'https',
        hostname: 'imgflip.com',
      },
      {
        protocol: 'https',
        hostname: '*.imgflip.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.insforge.app',
      },
      {
        protocol: 'https',
        hostname: '*.ap-southeast.insforge.app',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  async headers() {
    // Disable strict CSP during local development for fast hot-reload & WebSocket connections
    if (process.env.NODE_ENV === 'development') {
      return [];
    }

    return [
      {
        source: '/:path((?!_next/static|_next/image).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/(logo.png|favicon.ico|icon.png|apple-icon.png|globe.svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const isDev = process.env.NODE_ENV === 'development';
const hasSentry = Boolean(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_PROJECT);

export default (isDev || !hasSentry)
  ? nextConfig
  : withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: true,
      tunnelRoute: '/monitoring',
      silent: !process.env.CI,
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
      },
    });
