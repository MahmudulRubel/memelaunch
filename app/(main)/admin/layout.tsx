import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moderation Station | MemeLaunch',
  description: 'MemeLaunch administration and moderation dashboard.',
  alternates: {
    canonical: 'https://www.launchme.me/admin',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
