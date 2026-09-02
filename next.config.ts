import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://tagmanager.google.com https://va.vercel-scripts.com https://*.posthog.com https://us.i.posthog.com https://eu.i.posthog.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.insforge.app https://*.ap-southeast.insforge.app https://*.unsplash.com https://*.imgflip.com https://imgflip.com https://i.imgflip.com https://*.googleusercontent.com https://avatars.githubusercontent.com https://nicklaunches.com https://*.nicklaunches.com https://saascity.io https://*.saascity.io https://scrolllaunch.com https://*.scrolllaunch.com https://www.scrolllaunch.com https://cdn.aidirectori.es https://*.aidirectori.es https://aidirectori.es https://fazier.com https://*.fazier.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.insforge.app https://*.ap-southeast.insforge.app https://*.sentry.io https://*.ingest.sentry.io https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.posthog.com https://us.i.posthog.com https://eu.i.posthog.com https://app.posthog.com https://va.vercel-scripts.com https://vitals.vercel-insights.com;
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
      {
        protocol: 'https',
        hostname: 'nicklaunches.com',
      },
      {
        protocol: 'https',
        hostname: '*.nicklaunches.com',
      },
      {
        protocol: 'https',
        hostname: 'saascity.io',
      },
      {
        protocol: 'https',
        hostname: '*.saascity.io',
      },
      {
        protocol: 'https',
        hostname: 'scrolllaunch.com',
      },
      {
        protocol: 'https',
        hostname: '*.scrolllaunch.com',
      },
      {
        protocol: 'https',
        hostname: 'www.scrolllaunch.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.aidirectori.es',
      },
      {
        protocol: 'https',
        hostname: 'aidirectori.es',
      },
      {
        protocol: 'https',
        hostname: '*.aidirectori.es',
      },
      {
        protocol: 'https',
        hostname: 'fazier.com',
      },
      {
        protocol: 'https',
        hostname: '*.fazier.com',
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
