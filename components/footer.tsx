'use client';

import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/safe-image';

interface PartnerItem {
  id: string;
  name: string;
  href: string;
  imgSrc: string;
  alt: string;
  width: number;
  height: number;
}

const PARTNERS: PartnerItem[] = [
  {
    id: 'nick-launches',
    name: 'Nick Launches',
    href: 'https://nicklaunches.com/products/memelaunch/?utm_source=launchme.me&utm_medium=badge&utm_campaign=featured',
    imgSrc: 'https://nicklaunches.com/badges/featured.png',
    alt: 'MemeLaunch on Nick Launches',
    width: 244,
    height: 56,
  },
  {
    id: 'saascity',
    name: 'SaaSCity',
    href: 'https://saascity.io',
    imgSrc: 'https://saascity.io/badges/featured-light.svg',
    alt: 'Featured on SaaSCity',
    width: 150,
    height: 54,
  },
  {
    id: 'scrolllaunch',
    name: 'ScrollLaunch',
    href: 'https://www.scrolllaunch.com/products/memelaunch?ref=badge',
    imgSrc: 'https://www.scrolllaunch.com/api/badge/memelaunch',
    alt: 'Featured on ScrollLaunch',
    width: 220,
    height: 48,
  },
  {
    id: 'ai-directories',
    name: 'AI Directories',
    href: 'https://www.aidirectori.es',
    imgSrc: 'https://cdn.aidirectori.es/ai-tools/badges/light-mode.png',
    alt: 'AI Directories Badge',
    width: 200,
    height: 54,
  },
  {
    id: 'fazier',
    name: 'Fazier',
    href: 'https://fazier.com/launches/www.launchme.me',
    imgSrc: 'https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light',
    alt: 'Fazier badge',
    width: 250,
    height: 54,
  },
];

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
              title="LaunchMeme Home"
            >
              <SafeImage 
                src="/logo.png" 
                fallbackType="logo"
                alt="LaunchMeme Logo" 
                width={160}
                height={40}
                className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              />
            </Link>
            <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-xs pt-1">
              Building the future of viral product discovery. Where ambitious founders seduce users with humor and win the internet.
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

        {/* Our Partners Marquee Section */}
        <div className="pt-6 pb-2 border-b border-zinc-800/80 overflow-hidden w-full">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffe600] inline-block animate-pulse"></span>
              Our Partners
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Featured Launch Partners</span>
          </div>

          <div className="relative w-full overflow-hidden no-scrollbar py-1">
            <div className="animate-marquee flex items-center gap-8">
              {/* First track copy */}
              <div className="flex items-center gap-8 shrink-0">
                {PARTNERS.map((partner) => (
                  <a
                    key={`p1-${partner.id}`}
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center group opacity-85 hover:opacity-100 transition-opacity"
                    title={`${partner.name} - Partner Badge`}
                  >
                    <img
                      src={partner.imgSrc}
                      alt={partner.alt}
                      width={partner.width}
                      height={partner.height}
                      className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
              
              {/* Duplicated track copy for seamless loop */}
              <div className="flex items-center gap-8 shrink-0">
                {PARTNERS.map((partner) => (
                  <a
                    key={`p2-${partner.id}`}
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center group opacity-85 hover:opacity-100 transition-opacity"
                    title={`${partner.name} - Partner Badge`}
                  >
                    <img
                      src={partner.imgSrc}
                      alt={partner.alt}
                      width={partner.width}
                      height={partner.height}
                      className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>

              {/* Triplicated track copy to fill wider screens seamlessly */}
              <div className="flex items-center gap-8 shrink-0">
                {PARTNERS.map((partner) => (
                  <a
                    key={`p3-${partner.id}`}
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center group opacity-85 hover:opacity-100 transition-opacity"
                    title={`${partner.name} - Partner Badge`}
                  >
                    <img
                      src={partner.imgSrc}
                      alt={partner.alt}
                      width={partner.width}
                      height={partner.height}
                      className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-zinc-400 font-bold">
          <div>
            © {new Date().getFullYear()} LaunchMeme. All memes reserved.
          </div>
          <div className="text-center sm:text-right text-zinc-500 font-mono">
            Not responsible for lost VC funding, tanked conversions, or burnt brain cells.
          </div>
        </div>
      </div>
    </footer>
  );
}
