import React from 'react';
import type { Metadata } from 'next';
import { insforge } from '@/lib/insforge';
import HomeFeed from './home-feed';
import type { Launch } from '@/components/feed/meme-card';

// Enable Incremental Static Regeneration (ISR) to cache the home page for 30 seconds.
// This gives sub-10ms response times for users while keeping the feed fresh.
export const revalidate = 30;

export const metadata: Metadata = {
  title: 'MemeLaunch - Build in Public. Launch in Humor. Win the Week.',
  description: 'MemeLaunch is the weekly battleground where indie hackers drop their funniest product memes, compete for top gold badges, and win real customers.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app',
  },
  openGraph: {
    title: 'MemeLaunch - Build in Public. Launch in Humor. Win the Week.',
    description: 'MemeLaunch is the weekly battleground where indie hackers drop their funniest product memes, compete for top gold badges, and win real customers.',
    url: 'https://memelaunch.insforge.app',
    siteName: 'MemeLaunch',
    images: [
      {
        url: 'https://memelaunch.insforge.app/globe.svg',
        width: 800,
        height: 600,
        alt: 'MemeLaunch Arena Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemeLaunch - Build in Public. Launch in Humor. Win the Week.',
    description: 'MemeLaunch is the weekly battleground where indie hackers drop their funniest product memes, compete for top gold badges, and win real customers.',
    images: ['https://memelaunch.insforge.app/globe.svg'],
  },
};

export default async function HomePage() {
  let initialLaunches: Launch[] = [];
  try {
    const { data, error } = await insforge.database
      .from('launches')
      .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      initialLaunches = data as Launch[];
    } else if (error) {
      console.error('Server-side error fetching launches:', error.message || error);
    }
  } catch (err) {
    console.error('Server-side exception fetching launches:', err);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MemeLaunch',
    description: 'MemeLaunch is the weekly battleground where indie hackers drop their funniest product memes, compete for top gold badges, and win real customers.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MemeLaunch',
      url: 'https://memelaunch.insforge.app',
      logo: 'https://memelaunch.insforge.app/favicon.ico',
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


