import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-900">
          {/* Logo Column */}
          <div className="md:col-span-1 space-y-3">
            <Link 
              id="footer-logo"
              href="/" 
              className="font-impact text-xl uppercase tracking-tight text-lime-400 select-none hover:text-lime-300 transition-colors"
            >
              MemeLaunch
            </Link>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">
              Building the future of product discovery, one elite shitpost at a time. Where SaaS meets high-octane memetics.
            </p>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Platform</h4>
            <ul className="space-y-2 text-xs text-zinc-500 font-medium">
              <li>
                <Link id="footer-link-feed" href="/" className="hover:text-lime-400 transition-colors">
                  Live Feed
                </Link>
              </li>
              <li>
                <Link id="footer-link-templates" href="/templates" className="hover:text-lime-400 transition-colors">
                  Meme Templates
                </Link>
              </li>
              <li>
                <a 
                  id="footer-link-github"
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-lime-400 transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Community</h4>
            <ul className="space-y-2 text-xs text-zinc-500 font-medium">
              <li>
                <Link id="footer-link-rules" href="/rules" className="hover:text-amber-400 transition-colors">
                  Arena Rules
                </Link>
              </li>
              <li>
                <Link id="footer-link-support" href="/support" className="hover:text-violet-400 transition-colors">
                  FAQ & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Legal</h4>
            <ul className="space-y-2 text-xs text-zinc-500 font-medium">
              <li>
                <Link id="footer-link-terms" href="/terms" className="hover:text-lime-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link id="footer-link-privacy" href="/privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[10px] sm:text-xs text-zinc-600 font-mono">
          <div>
            © {new Date().getFullYear()} MemeLaunch. All memes reserved.
          </div>
          <div className="text-center sm:text-right text-zinc-600">
            Not responsible for lost VC funding, tanked conversions, or burnt brain cells.
          </div>
        </div>
      </div>
    </footer>
  );
}

