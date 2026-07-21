import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | MemeLaunch',
  description: 'Set a new password for your MemeLaunch account.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/reset-password',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
