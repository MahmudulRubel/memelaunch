import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.launchme.me"),
  title: {
    default: "MemeLaunch — Build in Public. Launch in Humor. Win the Week.",
    template: "%s | MemeLaunch",
  },
  description: "MemeLaunch is the viral product launch arena where indie hackers, founders, and creators drop their funniest software memes, compete for gold badges, and win real users.",
  keywords: [
    "meme launch",
    "product hunt alternative",
    "indie hacker launch",
    "viral product pitch",
    "saas memes",
    "startup launch platform",
    "meme marketing",
    "software launch arena"
  ],
  authors: [{ name: "MemeLaunch Team", url: "https://www.launchme.me" }],
  creator: "MemeLaunch",
  publisher: "MemeLaunch",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.launchme.me",
    siteName: "MemeLaunch",
    title: "MemeLaunch — Build in Public. Launch in Humor. Win the Week.",
    description: "The playful, high-contrast alternative to Product Hunt. Pitch your SaaS or dev tool using viral memes.",
    images: [
      {
        url: "https://www.launchme.me/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "MemeLaunch — Build in Public. Launch in Humor.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MemeLaunch — Build in Public. Launch in Humor. Win the Week.",
    description: "The playful, high-contrast alternative to Product Hunt. Pitch your SaaS or dev tool using viral memes.",
    site: "@launchme_me",
    creator: "@launchme_me",
    images: ["https://www.launchme.me/og-image.png"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // AEO & Structured Data Schemas
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MemeLaunch",
    url: "https://www.launchme.me",
    logo: "https://www.launchme.me/favicon.ico",
    sameAs: [
      "https://x.com/builtwithrubel"
    ],
    description: "Meme-native product launch arena for indie hackers and startup founders.",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MemeLaunch",
    url: "https://www.launchme.me",
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string"
    }
  };
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <head>
        {/* Resource hints for instant TLS handshake & asset fetching */}
        <link rel="preconnect" href="https://fw47aqh3.ap-southeast.insforge.app" />
        <link rel="dns-prefetch" href="https://fw47aqh3.ap-southeast.insforge.app" />
        <link rel="preconnect" href="https://i.imgflip.com" />
        <link rel="dns-prefetch" href="https://i.imgflip.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans">
        <PostHogProvider>
          <AuthProvider>
            {children}
            <CookieConsentBanner />
          </AuthProvider>
        </PostHogProvider>
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-5DMR4BVQ4V" />
    </html>
  );
}
