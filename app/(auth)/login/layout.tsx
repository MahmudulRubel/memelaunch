import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | MemeLaunch',
  description: 'Log in to your MemeLaunch account to start launching products and voting.',
  alternates: {
    canonical: 'https://www.launchme.me/login',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
