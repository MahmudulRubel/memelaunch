import React from 'react';
import type { Metadata } from 'next';
import { insforge, insforgeAdmin } from '@/lib/insforge';
import HomeFeed from './home-feed';
import type { Launch } from '@/components/feed/meme-card';

// Enable Incremental Static Regeneration (ISR) to cache the home page for 30 seconds.
// This gives sub-10ms response times for users while keeping the feed fresh.
export const revalidate = 30;

export const metadata: Metadata = {
  title: 'LaunchMeme — Stop Launching to Crickets. Go Viral with Memes.',
  description: 'LaunchMeme is the seductive viral battleground where founders turn software into irresistible sensations. Drop your meme, hook paying users, and claim the #1 weekly crown.',
  alternates: {
    canonical: 'https://www.launchme.me',
  },
  openGraph: {
    title: 'LaunchMeme — Stop Launching to Crickets. Go Viral with Memes.',
    description: 'LaunchMeme is the seductive viral battleground where founders turn software into irresistible sensations. Drop your meme, hook paying users, and claim the #1 weekly crown.',
    url: 'https://www.launchme.me',
    siteName: 'LaunchMeme',
    images: [
      {
        url: 'https://www.launchme.me/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'LaunchMeme — Stop Launching to Crickets. Go Viral with Memes.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaunchMeme — Stop Launching to Crickets. Go Viral with Memes.',
    description: 'LaunchMeme is the seductive viral battleground where founders turn software into irresistible sensations. Drop your meme, hook paying users, and claim the #1 weekly crown.',
    site: '@launchme_me',
    creator: '@launchme_me',
    images: ['https://www.launchme.me/og-image.png'],
  },
};

export default async function HomePage() {
  let initialLaunches: Launch[] = [];
  try {
    const fetchPromise = insforgeAdmin.database
      .from('launches')
      .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Database fetch timeout' } }), 10000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (!error && data) {
      initialLaunches = data as Launch[];
    } else if (error) {
      console.warn('Server-side notice fetching launches (client will fallback if needed):', error.message || error);
    }
  } catch (err) {
    console.error('Server-side exception fetching launches:', err);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LaunchMeme',
    description: 'LaunchMeme is the seductive viral battleground where founders turn software into irresistible sensations. Drop your meme, hook paying users, and claim the #1 weekly crown.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LaunchMeme',
      url: 'https://www.launchme.me',
      logo: 'https://www.launchme.me/favicon.ico',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeFeed initialLaunches={initialLaunches} />
    </>
  );
}


