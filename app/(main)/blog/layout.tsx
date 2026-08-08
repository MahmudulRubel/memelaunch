import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'MemeLaunch Blog — Growth, Playbooks & Software Memes',
    template: '%s | MemeLaunch Blog',
  },
  description: 'Actionable marketing guides, viral launch playbooks, and meme strategies for indie hackers, SaaS founders, and software creators.',
  openGraph: {
    title: 'MemeLaunch Blog — Growth, Playbooks & Software Memes',
    description: 'Actionable marketing guides, viral launch playbooks, and meme strategies for indie hackers and software creators.',
    url: 'https://memelaunch.insforge.app/blog',
    siteName: 'MemeLaunch',
    type: 'website',
  },
  alternates: {
    canonical: 'https://memelaunch.insforge.app/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
