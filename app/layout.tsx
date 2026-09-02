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
    default: "LaunchMeme — Pitch with Memes. Launch Virally. Win Real Users.",
    template: "%s | LaunchMeme",
  },
  description: "LaunchMeme is the seductive, high-converting product launch arena for founders, indie hackers, and SaaS creators. Stop launching to crickets — drop your funniest software memes, dominate the leaderboard, and hook thousands of paying users.",
  keywords: [
    "launchmeme",
    "launch meme",
    "product launch",
    "indie hacker launch",
    "viral product pitch",
    "saas memes",
    "product hunt alternative",
    "startup launch arena",
    "meme marketing",
    "growth hacking"
  ],
  authors: [{ name: "LaunchMeme Team", url: "https://www.launchme.me" }],
  creator: "LaunchMeme",
  publisher: "LaunchMeme",
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
    siteName: "LaunchMeme",
    title: "LaunchMeme — Pitch with Memes. Launch Virally. Win Real Users.",
    description: "Tired of launching to crickets? LaunchMeme turns your product into viral gold. Pitch with memes, compete for gold badges, and seduce real customers.",
    images: [
      {
        url: "https://www.launchme.me/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "LaunchMeme — Pitch with Memes. Launch Virally. Win Real Users.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LaunchMeme — Pitch with Memes. Launch Virally. Win Real Users.",
    description: "Tired of launching to crickets? LaunchMeme turns your product into viral gold. Pitch with memes, compete for gold badges, and seduce real customers.",
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
    name: "LaunchMeme",
    url: "https://www.launchme.me",
    logo: "https://www.launchme.me/favicon.ico",
    sameAs: [
      "https://x.com/builtwithrubel"
    ],
    description: "The viral, meme-powered product launch arena where founders and creators win real users.",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LaunchMeme",
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
