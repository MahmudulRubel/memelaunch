import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Launch a Product | MemeLaunch',
  description: 'Craft a viral meme, submit your product specifications and screenshots, and launch to the public feed.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/launch',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LaunchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
