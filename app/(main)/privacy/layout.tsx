import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Rights Hub | MemeLaunch',
  description: 'Comprehensive Privacy Policy, Cookie Disclosures, GDPR Rights Portal, and Data Processing Agreement for MemeLaunch.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Data Rights Hub | MemeLaunch',
    description: 'Comprehensive Privacy Policy, Cookie Disclosures, GDPR Rights Portal, and Data Processing Agreement for MemeLaunch.',
    url: 'https://memelaunch.insforge.app/privacy',
    siteName: 'MemeLaunch',
    type: 'website',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
