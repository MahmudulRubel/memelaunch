import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | MemeLaunch',
  description: 'Join the MemeLaunch community, create your founder profile, and start shitposting your products to success.',
  alternates: {
    canonical: 'https://memelaunch.insforge.app/signup',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
