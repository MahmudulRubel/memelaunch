import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Founder Analytics & Product Insights | MemeLaunch',
  description: 'Track real-time upvotes, product page views, and outbound link click-through rates (CTR) across your live products.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/analytics',
  },
  openGraph: {
    title: 'Founder Analytics & Product Insights | MemeLaunch',
    description: 'Track real-time upvotes, product page views, and outbound link click-through rates (CTR) across your live products.',
    url: 'https://memelaunch.insforge.app/analytics',
    siteName: 'MemeLaunch',
    type: 'website',
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
