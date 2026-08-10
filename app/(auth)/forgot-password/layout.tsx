import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recover Password | MemeLaunch',
  description: 'Enter your email to reset your password and get back into the arena.',
  alternates: {
    canonical: 'https://www.launchme.me/forgot-password',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
