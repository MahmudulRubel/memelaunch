'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { getUserPoints } from '@/lib/points';
import { Menu, X, LogOut, User, Plus, Compass, Trophy, LayoutGrid, Settings, Zap, BarChart3, Sparkles, ChevronRight } from 'lucide-react';

const EarnPointsModal = dynamic(
  () => import('@/components/points/earn-points-modal').then((m) => m.EarnPointsModal),
  { ssr: false }
);

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    if (!user) return;
    async function fetchPoints() {
      const pts = await getUserPoints(user!.id);
      setUserPoints(pts);
    }
    fetchPoints();
  }, [user, pathname]);

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
    { name: 'Feed', href: '/', icon: Compass, description: 'Explore & upvote trending pitches' },
    { name: 'Templates', href: '/templates', icon: LayoutGrid, description: 'Browse popular meme canvases' },
    { name: 'Rules', href: '/rules', icon: Settings, description: 'Platform guidelines & pitch rules' },
  ];

  const getActiveLinkClass = (href: string) => {
    const isActive = pathname === href;
    return isActive
      ? 'text-[#ffe600] font-black border-b-4 border-[#ffe600] pb-1 pt-1 tracking-wider uppercase text-xs sm:text-sm'
      : 'text-zinc-300 hover:text-[#ffe600] transition-colors font-extrabold pb-1 pt-1 tracking-wider uppercase text-xs sm:text-sm';
  };

  const getMobileActiveLinkClass = (href: string) => {
    const isActive = pathname === href;
    return isActive
      ? 'text-zinc-950 bg-[#ffe600] font-black flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black shadow-brutal-sm uppercase text-sm'
      : 'text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600]/80 transition-all flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black bg-zinc-900 uppercase text-sm font-bold';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-8 shrink-0">
            <Link 
              href="/" 
              className="flex items-center group hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform shrink-0"
              title="MemeLaunch Home"
            >
              <Image 
                src="/logo.png" 
                alt="Launchme MemeLaunch Logo" 
                width={180}
                height={48}
                priority
                className="h-9 sm:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] shrink-0"
                style={{ width: 'auto' }}
              />
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
              <div className="h-9 w-24 bg-zinc-900 border-2 border-black rounded-xl animate-pulse" />
            ) : user ? (
              // Authenticated View
              <div className="flex items-center gap-4">
                {/* Points Counter Pill */}
                <button
                  onClick={() => setIsPointsModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-[#ffe600] hover:bg-[#ffe600] hover:text-zinc-950 shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  title="Click to view and earn points"
                >
                  <Zap className="h-4 w-4 fill-[#ffe600] text-[#ffe600] hover:fill-zinc-950" />
                  <span>{userPoints} Pts</span>
                </button>

                {/* Submit / Launch Button */}
                <Link
                  href="/launch"
                  className="flex items-center gap-2 px-4 py-2 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 border-2 border-black font-black uppercase text-xs tracking-wider rounded-xl shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Pitch a Meme</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 bg-zinc-900 border-2 border-black rounded-full hover:bg-zinc-800 transition-all shadow-brutal-sm focus:outline-none"
                  >
                    <div className={`h-8 w-8 rounded-full border border-black flex items-center justify-center text-sm font-black overflow-hidden ${user.profile?.avatar_url ? 'bg-[#ffe600]' : getAvatarGradient(user.profile?.name || user.email)}`}>
                      {user.profile?.avatar_url ? (
                        <Image 
                          src={resolveStorageUrl(user.profile.avatar_url)} 
                          alt={user.profile.name || 'User'} 
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{user.profile?.name ? user.profile.name[0].toUpperCase() : user.email[0].toUpperCase()}</span>
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
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl border-2 border-black bg-zinc-950 p-2 shadow-brutal z-20 animate-in fade-in slide-in-from-top-2 duration-100">
                        <div className="px-3 py-2 border-b-2 border-zinc-800 mb-1">
                          <p className="text-sm font-black text-zinc-100 truncate">
                            {user.profile?.name || 'Founder'}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          href="/analytics"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] rounded-xl transition-colors border border-transparent hover:border-black"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Analytics</span>
                        </Link>

                        <Link
                          href={`/profile/${user.id}`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-zinc-950 hover:bg-[#ffe600] rounded-xl transition-colors border border-transparent hover:border-black"
                        >
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>

                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-100 hover:bg-rose-950/80 rounded-xl transition-colors text-left border border-transparent hover:border-rose-500"
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
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-zinc-200 hover:text-[#ffe600] transition-colors border-2 border-transparent hover:border-black rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 border-2 border-black font-black uppercase text-xs tracking-wider rounded-xl shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Pitch a Meme</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Header Quick Actions */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={() => setIsPointsModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-[#ffe600] shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
                title="Earn points"
              >
                <Zap className="h-3.5 w-3.5 fill-[#ffe600] text-[#ffe600]" />
                <span>{userPoints}</span>
              </button>
            )}

            <Link
              href="/launch"
              className="flex items-center gap-1 px-3 py-1.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 border-2 border-black font-black uppercase text-xs tracking-wider rounded-xl shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Pitch</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-100 bg-zinc-900 border-2 border-black shadow-brutal-sm focus:outline-none transition-colors active:scale-95"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphism Mobile Overlay Sheet (<768px) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40 md:hidden animate-in fade-in duration-300" 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Glass Sheet Container */}
          <div className="fixed top-16 left-0 right-0 z-50 md:hidden bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-800/60 p-4 sm:p-5 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-4 fade-in duration-300 ease-out">
            <div className="space-y-4 max-w-md mx-auto">
              
              {/* User Identity Glass Header */}
              {user ? (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 via-zinc-900/90 to-zinc-900/90 rounded-2xl border border-yellow-500/30 shadow-lg">
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className={`h-10 w-10 rounded-full border-2 border-[#ffe600] flex items-center justify-center text-sm font-black overflow-hidden shrink-0 shadow-[0_0_10px_rgba(255,230,0,0.3)] ${user.profile?.avatar_url ? 'bg-[#ffe600]' : getAvatarGradient(user.profile?.name || user.email)}`}>
                      {user.profile?.avatar_url ? (
                        <Image 
                          src={resolveStorageUrl(user.profile.avatar_url)} 
                          alt={user.profile.name || 'User'} 
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{user.profile?.name ? user.profile.name[0].toUpperCase() : user.email[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-zinc-100 truncate">
                        {user.profile?.name || 'Founder'}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsPointsModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-black uppercase bg-[#ffe600] text-zinc-950 px-3.5 py-2 rounded-xl shadow-[0_0_15px_rgba(255,230,0,0.4)] hover:scale-105 active:scale-95 transition-all shrink-0 border border-black"
                  >
                    <Zap className="h-4 w-4 fill-zinc-950 text-zinc-950" />
                    <span>{userPoints} Pts</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 via-zinc-900/90 to-zinc-900/90 rounded-2xl border border-yellow-500/30">
                  <div>
                    <p className="text-sm font-extrabold text-zinc-100">Welcome to MemeLaunch</p>
                    <p className="text-xs text-zinc-400">Join to pitch & upvote viral memes</p>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-xl shadow-[0_0_15px_rgba(255,230,0,0.4)] hover:scale-105 active:scale-95 transition-all border border-black shrink-0"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Vertical Nav Stack with Descriptions */}
              <div className="space-y-2.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group ${
                        isActive 
                          ? 'bg-gradient-to-r from-yellow-500/15 via-zinc-900/90 to-zinc-900/90 border-yellow-500/50 shadow-[0_0_20px_rgba(255,230,0,0.1)]' 
                          : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl border transition-colors ${
                          isActive 
                            ? 'bg-[#ffe600] text-zinc-950 border-black shadow-[0_0_10px_rgba(255,230,0,0.4)]' 
                            : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 group-hover:text-[#ffe600] group-hover:bg-zinc-800'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-[#ffe600]' : 'text-zinc-100 group-hover:text-[#ffe600]'}`}>
                            {link.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {link.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-[#ffe600]' : 'text-zinc-600 group-hover:text-zinc-300'}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Featured Pitch CTA Card */}
              <Link
                href="/launch"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#ffe600] to-amber-400 text-zinc-950 font-black uppercase text-xs sm:text-sm tracking-wider shadow-[0_0_25px_rgba(255,230,0,0.35)] hover:shadow-[0_0_35px_rgba(255,230,0,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all border border-black"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-950 text-[#ffe600]">
                    <Plus className="h-4 w-4 stroke-[3]" />
                  </div>
                  <div className="flex flex-col">
                    <span>Pitch a Meme</span>
                    <span className="text-[10px] font-bold text-zinc-900/80 normal-case">Launch your meme idea now</span>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 fill-zinc-950" />
              </Link>

              {/* Account Tools (If Logged In) */}
              {user && (
                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                  <div className="px-1 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                    Account & Tools
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/analytics"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 font-extrabold uppercase text-xs tracking-wider transition-all"
                    >
                      <BarChart3 className="h-4 w-4 text-[#ffe600]" />
                      <span>Analytics</span>
                    </Link>

                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 font-extrabold uppercase text-xs tracking-wider transition-all"
                    >
                      <User className="h-4 w-4 text-[#ffe600]" />
                      <span>Profile</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-rose-950/20 hover:bg-rose-950/60 border border-rose-900/60 rounded-2xl font-extrabold uppercase text-xs text-rose-400 transition-all hover:border-rose-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Earn Points Modal Popup */}
      <EarnPointsModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        onPointsUpdated={(newPts) => setUserPoints(newPts)}
      />
    </header>
  );
}
