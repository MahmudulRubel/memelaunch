import React from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <Navigation />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
