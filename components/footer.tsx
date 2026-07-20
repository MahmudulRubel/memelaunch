import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
            <Link 
              href="/" 
              className="font-impact text-lg uppercase tracking-tight text-lime-400 select-none"
            >
              MemeLaunch
            </Link>
            <p className="text-zinc-500 text-xs mt-1">
              Building the future of discovery, one elite shitpost at a time.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/" className="hover:text-lime-400 transition-colors">
              Feed
            </Link>
            <Link href="/templates" className="hover:text-lime-400 transition-colors">
              Templates
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-lime-400 transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            © {new Date().getFullYear()} MemeLaunch. Not responsible for lost VC funding or brain cells.
          </div>
        </div>
      </div>
    </footer>
  );
}
