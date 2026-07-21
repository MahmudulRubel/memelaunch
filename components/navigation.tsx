'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { resolveStorageUrl } from '@/lib/insforge';
import { Menu, X, LogOut, User, Plus, Compass, Trophy, Settings } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push('/');
      router.refresh();
    }
  };

  const navLinks = [
    { name: 'Feed', href: '/', icon: Compass },
    { name: 'Templates', href: '/templates', icon: Trophy },
  ];

  const getActiveLinkClass = (href: string) => {
    const isActive = pathname === href;
    return isActive
      ? 'text-lime-400 font-extrabold border-b-2 border-lime-400 pb-1 pt-1'
      : 'text-zinc-400 hover:text-zinc-100 transition-colors font-medium pb-1 pt-1';
  };

  const getMobileActiveLinkClass = (href: string) => {
    const isActive = pathname === href;
    return isActive
      ? 'text-lime-400 bg-zinc-900/60 font-extrabold flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 border-lime-400'
      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40 transition-all flex items-center gap-3 px-4 py-3 rounded-xl';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="font-impact text-2xl uppercase tracking-tight text-lime-400 hover:text-lime-300 transition-colors duration-200 select-none"
            >
              MemeLaunch
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className={`${getActiveLinkClass(link.href)} flex items-center gap-2`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Auth and Submission buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              // Loading state placeholder
              <div className="h-9 w-24 bg-zinc-900 animate-pulse rounded-md" />
            ) : user ? (
              // Authenticated View
              <div className="flex items-center gap-4">
                {/* Submit / Launch Button */}
                <Link
                  href="/launch"
                  className="flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-md transition-all shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Launch Meme</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-full hover:border-zinc-700 transition-colors focus:outline-none"
                  >
                    <div className="h-7 w-7 rounded-full bg-lime-400/20 border border-lime-400/30 flex items-center justify-center text-lime-400 text-sm font-extrabold overflow-hidden">
                      {user.profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={resolveStorageUrl(user.profile.avatar_url)} 
                          alt={user.profile.name || 'User'} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.profile?.name ? user.profile.name[0].toUpperCase() : user.email[0].toUpperCase()
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-100">
                        <div className="px-3 py-2 border-b border-zinc-800/60 mb-1">
                          <p className="text-sm font-bold text-zinc-200 truncate">
                            {user.profile?.name || 'Founder'}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">
                            {user.email}
                          </p>
                        </div>

                         <Link
                          href={`/profile/${user.id}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl transition-colors"
                        >
                          <User className="h-4 w-4 text-zinc-400" />
                          <span>My Profile</span>
                        </Link>

                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Unauthenticated View
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-md transition-all shadow-[0_0_15px_rgba(163,230,53,0.15)] active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Launch Meme</span>
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950 p-4 space-y-4 animate-in slide-in-from-top-5 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={getMobileActiveLinkClass(link.href)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-base">{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-zinc-800/60 pt-4">
            {isLoading ? (
              <div className="h-10 w-full bg-zinc-900 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-zinc-900/40 rounded-xl border border-zinc-800/40">
                  <p className="text-sm font-bold text-zinc-200 truncate">
                    {user.profile?.name || 'Founder'}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                </div>
                
                <Link
                  href="/launch"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(163,230,53,0.15)]"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Launch Meme</span>
                </Link>

                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/60 rounded-xl transition-colors"
                >
                  <User className="h-5 w-5 text-zinc-400" />
                  <span>My Profile</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-colors text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-colors shadow-[0_0_15px_rgba(163,230,53,0.15)]"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Launch</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
