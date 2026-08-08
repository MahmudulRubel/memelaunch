import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Meme World Cup — Weekly Startup Tournament | MemeLaunch',
  description: '16 Startups. 4 Groups. 1-on-1 Elimination Knockouts. Vote daily to decide which product takes home the weekly World Cup Trophy!',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/world-cup',
  },
  openGraph: {
    title: 'The Meme World Cup — Weekly Startup Tournament | MemeLaunch',
    description: '16 Startups. 4 Groups. 1-on-1 Elimination Knockouts. Vote daily to decide which product takes home the weekly World Cup Trophy!',
    url: 'https://memelaunch.insforge.app/world-cup',
    siteName: 'MemeLaunch',
    type: 'website',
  },
};

export default function WorldCupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
