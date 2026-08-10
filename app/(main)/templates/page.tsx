import React from 'react';
import type { Metadata } from 'next';
import { insforge } from '@/lib/insforge';
import TemplatesFeed from './templates-feed';
import type { Template, Launch } from './templates-feed';

// Enable ISR (Incremental Static Regeneration) to cache templates page for 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Meme Templates | MemeLaunch',
  description: 'Choose from our library of viral meme templates to kickstart your product launch. Stop building in silence.',
  alternates: {
    canonical: 'https://www.launchme.me/templates',
  },
  openGraph: {
    title: 'Meme Templates | MemeLaunch',
    description: 'Choose from our library of viral meme templates to kickstart your product launch. Stop building in silence.',
    url: 'https://www.launchme.me/templates',
    siteName: 'MemeLaunch',
    images: [
      {
        url: 'https://www.launchme.me/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MemeLaunch Templates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meme Templates | MemeLaunch',
    description: 'Choose from our library of viral meme templates to kickstart your product launch. Stop building in silence.',
    site: '@launchme_me',
    creator: '@launchme_me',
    images: ['https://www.launchme.me/og-image.jpg'],
  },
};

export default async function TemplatesPage() {
  let initialTemplates: Template[] = [];
  let initialLaunches: Launch[] = [];

  try {
    const fetchPromise = Promise.all([
      insforge.database
        .from('templates')
        .select('*')
        .order('usage_count', { ascending: false }),
      insforge.database
        .from('launches')
        .select('*, users(name, avatar), reactions(emoji_type)')
        .eq('is_approved', true)
        .not('template_id', 'is', null)
    ]);

    const timeoutPromise = new Promise<[any, any]>((resolve) =>
      setTimeout(() => resolve([{ data: null, error: { message: 'Timeout' } }, { data: null, error: { message: 'Timeout' } }]), 10000)
    );

    const [templatesRes, launchesRes] = await Promise.race([fetchPromise, timeoutPromise]);

    if (!templatesRes.error && templatesRes.data) {
      initialTemplates = templatesRes.data as Template[];
    }
    if (!launchesRes.error && launchesRes.data) {
      initialLaunches = launchesRes.data as Launch[];
    }
  } catch (err) {
    console.error('Server-side error fetching templates data:', err);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://memelaunch.insforge.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Templates',
        item: 'https://memelaunch.insforge.app/templates',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplatesFeed
        initialTemplates={initialTemplates}
        initialLaunches={initialLaunches}
      />
    </>
  );
}

