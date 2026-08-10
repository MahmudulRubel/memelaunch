import React from 'react';
import type { Metadata } from 'next';
import { insforge } from '@/lib/insforge';
import ProfileView from './profile-view';
import type { Launch } from '@/components/feed/meme-card';

// Cache the profile page for 60 seconds (ISR)
export const revalidate = 60;

interface ProfileData {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data: profile } = await insforge.database
      .from('users')
      .select('name, bio')
      .eq('id', id)
      .single();

    const name = profile?.name || 'Founder';
    const bio = profile?.bio || 'MemeLaunch builder cooking something special.';

    return {
      title: `${name} | MemeLaunch Founder Profile`,
      description: bio,
      alternates: {
        canonical: `https://www.launchme.me/profile/${id}`,
      },
      openGraph: {
        title: `${name} | MemeLaunch Founder Profile`,
        description: bio,
        url: `https://www.launchme.me/profile/${id}`,
        siteName: 'MemeLaunch',
        locale: 'en_US',
        type: 'profile',
        username: name.toLowerCase().replace(/\s+/g, ''),
      },
      twitter: {
        card: 'summary',
        title: `${name} | MemeLaunch Founder Profile`,
        description: bio,
      },
    };
  } catch (e) {
    return {
      title: 'Founder Profile | MemeLaunch',
      description: 'View founder achievements and launched products on MemeLaunch.',
    };
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let initialProfile: ProfileData | null = null;
  let initialLaunches: Launch[] = [];

  try {
    const fetchPromise = Promise.all([
      insforge.database
        .from('users')
        .select('*')
        .eq('id', id)
        .single(),
      insforge.database
        .from('launches')
        .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
        .eq('user_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
    ]);

    const timeoutPromise = new Promise<[any, any]>((resolve) =>
      setTimeout(() => resolve([{ data: null, error: { message: 'Timeout' } }, { data: null, error: { message: 'Timeout' } }]), 10000)
    );

    const [profileRes, launchesRes] = await Promise.race([fetchPromise, timeoutPromise]);

    if (!profileRes.error && profileRes.data) {
      initialProfile = profileRes.data as ProfileData;
    }
    if (!launchesRes.error && launchesRes.data) {
      initialLaunches = launchesRes.data as Launch[];
    }
  } catch (err) {
    console.error('Server-side error fetching profile data:', err);
  }

  const profileName = initialProfile?.name || 'Founder';

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
        name: `${profileName}'s Profile`,
        item: `https://memelaunch.insforge.app/profile/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileView
        profileId={id}
        initialProfile={initialProfile}
        initialLaunches={initialLaunches}
      />
    </>
  );
}

