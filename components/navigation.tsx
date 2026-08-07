'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { resolveStorageUrl, getAvatarGradient } from '@/lib/insforge';
import { getUserPoints } from '@/lib/points';
import { Menu, X, LogOut, User, Plus, Compass, Trophy, LayoutGrid, Settings, Zap, BarChart3, Sparkles } from 'lucide-react';

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
    { name: 'Templates', href: '/templates', icon: LayoutGrid },
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

      {/* Desktop-like Mobile Top Dropdown Menu (<768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-zinc-950/98 backdrop-blur-xl p-4 shadow-brutal animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-4">
            {/* User Info Bar if logged in */}
            {user ? (
              <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border-2 border-black">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-black text-zinc-100 truncate">
                    {user.profile?.name || 'Founder'}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsPointsModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-black uppercase bg-[#ffe600] text-zinc-950 px-2.5 py-1 rounded-lg border-2 border-black shadow-brutal-sm"
                >
                  <Zap className="h-3.5 w-3.5 fill-zinc-950" />
                  <span>{userPoints} Pts</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border-2 border-black">
                <p className="text-xs font-bold text-zinc-300">Join MemeLaunch to pitch memes!</p>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 bg-[#ffe600] text-zinc-950 font-black uppercase text-xs rounded-lg border-2 border-black shadow-brutal-sm"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Desktop-style Navigation Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t-2 border-zinc-800">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition-all ${
                      isActive 
                        ? 'bg-[#ffe600] text-zinc-950 shadow-brutal-sm' 
                        : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <Link
                href="/launch"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-black bg-zinc-900 text-zinc-200 hover:bg-zinc-800 font-black uppercase text-xs tracking-wider transition-all"
              >
                <Plus className="h-4 w-4 text-[#ffe600] stroke-[3]" />
                <span>Pitch a Meme</span>
              </Link>

              {user && (
                <Link
                  href="/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-black bg-zinc-900 text-zinc-200 hover:bg-zinc-800 font-black uppercase text-xs tracking-wider transition-all"
                >
                  <BarChart3 className="h-4 w-4 text-[#ffe600]" />
                  <span>Analytics</span>
                </Link>
              )}
            </div>

            {/* Bottom User Profile & Sign Out Links */}
            {user && (
              <div className="flex items-center justify-between pt-3 border-t-2 border-zinc-800 gap-2">
                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-xl font-black uppercase text-xs text-zinc-200"
                >
                  <User className="h-4 w-4 text-[#ffe600]" />
                  <span>My Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 hover:bg-rose-950 border-2 border-black rounded-xl font-black uppercase text-xs text-rose-400 hover:text-rose-100"
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
