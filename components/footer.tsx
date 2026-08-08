'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const handleOpenCookieSettings = () => {
    if (typeof window !== 'undefined' && (window as any).openCookieConsentModal) {
      (window as any).openCookieConsentModal();
    }
  };

  return (
    <footer className="w-full border-t-4 border-black bg-zinc-950 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b-2 border-zinc-800">
          {/* Logo Column */}
          <div className="md:col-span-1 space-y-3">
            <Link 
              id="footer-logo"
              href="/" 
              className="inline-block group hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
              title="MemeLaunch Home"
            >
              <Image 
                src="/logo.png" 
                alt="Launchme MemeLaunch Logo" 
                width={160}
                height={40}
                className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              />
            </Link>
            <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-xs pt-1">
              Building the future of product discovery, one elite meme at a time. Where SaaS founders pitch with humor.
            </p>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#ffe600]">Platform</h4>
            <ul className="space-y-2 text-xs text-zinc-300 font-bold">
              <li>
                <Link id="footer-link-feed" href="/" className="hover:text-[#ffe600] transition-colors">
                  Live Feed
                </Link>
              </li>
              <li>
                <Link id="footer-link-launch" href="/launch" className="hover:text-[#ffe600] transition-colors">
                  Meme Studio (/launch)
                </Link>
              </li>
              <li>
                <Link id="footer-link-templates" href="/templates" className="hover:text-[#ffe600] transition-colors">
                  Meme Templates
                </Link>
              </li>
              <li>
                <Link id="footer-link-world-cup" href="/world-cup" className="hover:text-[#ffe600] transition-colors">
                  The Meme World Cup 🏆
                </Link>
              </li>
              <li>
                <Link id="footer-link-analytics" href="/analytics" className="hover:text-[#ffe600] transition-colors">
                  Founder Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#ffe600]">Resources</h4>
            <ul className="space-y-2 text-xs text-zinc-300 font-bold">
              <li>
                <Link id="footer-link-blog" href="/blog" className="hover:text-[#ffe600] transition-colors text-cyan-400 font-extrabold">
                  Blog & Growth Playbooks 📖
                </Link>
              </li>
              <li>
                <Link id="footer-link-rules" href="/rules" className="hover:text-[#ffe600] transition-colors">
                  Arena Rules & Badges
                </Link>
              </li>
              <li>
                <Link id="footer-link-support" href="/support" className="hover:text-[#ffe600] transition-colors">
                  FAQ & Support
                </Link>
              </li>
              <li>
                <a
                  id="footer-link-x"
                  href="https://x.com/intent/follow?screen_name=launchme_me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#ffe600] transition-colors"
                >
                  Follow @launchme_me on X
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#ffe600]">Legal & Data</h4>
            <ul className="space-y-2 text-xs text-zinc-300 font-bold">
              <li>
                <Link id="footer-link-terms" href="/terms" className="hover:text-[#ffe600] transition-colors">
                  Terms & Guidelines
                </Link>
              </li>
              <li>
                <Link id="footer-link-privacy" href="/privacy" className="hover:text-[#ffe600] transition-colors">
                  Privacy Policy & Data Rights Hub
                </Link>
              </li>
              <li>
                <button
                  id="footer-link-cookies"
                  onClick={handleOpenCookieSettings}
                  className="hover:text-[#ffe600] transition-colors text-left font-bold"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-zinc-400 font-bold">
          <div>
            © {new Date().getFullYear()} MemeLaunch. All memes reserved.
          </div>
          <div className="text-center sm:text-right text-zinc-500 font-mono">
            Not responsible for lost VC funding, tanked conversions, or burnt brain cells.
          </div>
        </div>
      </div>
    </footer>
  );
}
