import React from 'react';
import type { Metadata } from 'next';
import { insforge } from '@/lib/insforge';
import HomeFeed from './home-feed';
import type { Launch } from '@/components/feed/meme-card';

// Enable Incremental Static Regeneration (ISR) to cache the home page for 30 seconds.
// This gives sub-10ms response times for users while keeping the feed fresh.
export const revalidate = 30;

export const metadata: Metadata = {
  title: 'MemeLaunch - If Your Product Was a Meme, What Would It Be?',
  description: 'Pitch your SaaS with pure humor, not boring pitch decks. If your product was a meme, what would it be? MemeLaunch is where founders shitpost their way to product-market fit.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app',
  },
  openGraph: {
    title: 'MemeLaunch - If Your Product Was a Meme, What Would It Be?',
    description: 'Pitch your SaaS with pure humor, not boring pitch decks. If your product was a meme, what would it be? MemeLaunch is where founders shitpost their way to product-market fit.',
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
    title: 'MemeLaunch - If Your Product Was a Meme, What Would It Be?',
    description: 'Pitch your SaaS with pure humor, not boring pitch decks. If your product was a meme, what would it be? MemeLaunch is where founders shitpost their way to product-market fit.',
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
    description: 'Pitch your SaaS with pure humor, not boring pitch decks. If your product was a meme, what would it be? MemeLaunch is where founders shitpost their way to product-market fit.',
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


