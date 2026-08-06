'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { getUserPoints } from '@/lib/points';
import { Menu, X, LogOut, User, Plus, Compass, Trophy, Settings, Zap, BarChart3 } from 'lucide-react';

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
    { name: 'Feed', href: '/', icon: Compass },
    { name: 'World Cup 🏆', href: '/world-cup', icon: Trophy },
    { name: 'Templates', href: '/templates', icon: Trophy },
    { name: 'Rules', href: '/rules', icon: Settings },
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
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="font-impact text-xl sm:text-2xl uppercase tracking-tight text-zinc-950 bg-[#ffe600] border-2 border-black px-3 py-1 rounded-xl shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all select-none flex items-center gap-2"
            >
              <span>🚀</span>
              <span>MemeLaunch</span>
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
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={resolveStorageUrl(user.profile.avatar_url)} 
                          alt={user.profile.name || 'User'} 
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
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase text-[#ffe600] shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
                title="Earn points"
              >
                <Zap className="h-3.5 w-3.5 fill-[#ffe600] text-[#ffe600]" />
                <span>{userPoints}</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-100 bg-zinc-900 border-2 border-black shadow-brutal-sm focus:outline-none transition-colors"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Mobile Navigation Bar (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t-4 border-black bg-zinc-950/95 backdrop-blur-md px-3 py-2 flex items-center justify-around">
        <Link 
          href="/" 
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase transition-colors ${
            pathname === '/' ? 'text-[#ffe600]' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span>Feed</span>
        </Link>

        <Link 
          href="/world-cup" 
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase transition-colors ${
            pathname === '/world-cup' ? 'text-[#ffe600]' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <Trophy className="h-5 w-5 text-amber-400" />
          <span>Cup</span>
        </Link>

        {/* Elevated Pitch CTA Button */}
        <Link 
          href="/launch" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex flex-col items-center justify-center -mt-6 h-12 w-12 rounded-2xl bg-[#ffe600] text-zinc-950 border-2 border-black shadow-brutal hover:bg-yellow-300 transition-all active:scale-95"
          title="Pitch a Meme"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </Link>

        <Link 
          href="/templates" 
          onClick={() => setMobileMenuOpen(false)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase transition-colors ${
            pathname === '/templates' ? 'text-[#ffe600]' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <Sparkles className="h-5 w-5" />
          <span>Templates</span>
        </Link>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase transition-colors ${
            mobileMenuOpen ? 'text-[#ffe600]' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Right Slide-over Sheet */}
          <div className="relative w-80 max-w-[85vw] h-full bg-zinc-950 border-l-4 border-black p-6 space-y-6 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚀</span>
                  <span className="font-impact text-xl uppercase tracking-tight text-[#ffe600]">MemeLaunch</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Identity Header in Drawer */}
              {user ? (
                <div className="p-3 bg-zinc-900 rounded-xl border-2 border-black space-y-1">
                  <p className="text-sm font-black text-zinc-100 truncate">
                    {user.profile?.name || 'Founder'}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-black text-[#ffe600] flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 fill-[#ffe600]" /> {userPoints} Points
                    </span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsPointsModalOpen(true);
                      }}
                      className="text-[10px] font-bold uppercase bg-[#ffe600] text-zinc-950 px-2 py-0.5 rounded border border-black"
                    >
                      Earn More
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-zinc-900 rounded-xl border-2 border-black text-center space-y-2">
                  <p className="text-xs font-bold text-zinc-300">Join MemeLaunch to pitch memes & earn points!</p>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-lg border border-black shadow-brutal-sm"
                  >
                    Sign In / Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Nav Links */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider px-1">Navigation</p>
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
                      <span className="text-sm font-bold">{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Account / Admin Links */}
              {user && (
                <div className="space-y-2 pt-2 border-t-2 border-zinc-800">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider px-1">Account & Creator Tools</p>
                  <Link
                    href="/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-xl font-bold uppercase text-xs"
                  >
                    <BarChart3 className="h-4 w-4 text-[#ffe600]" />
                    <span>Analytics</span>
                  </Link>

                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-xl font-bold uppercase text-xs"
                  >
                    <User className="h-4 w-4 text-zinc-400" />
                    <span>My Profile</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Sign Out */}
            {user && (
              <div className="pt-4 border-t-2 border-zinc-800">
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-rose-400 bg-zinc-900 border-2 border-black rounded-xl font-black uppercase text-xs text-center hover:bg-rose-950/80 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
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
