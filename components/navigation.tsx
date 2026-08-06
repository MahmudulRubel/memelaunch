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

          {/* Hamburger Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-100 bg-zinc-900 border-2 border-black shadow-brutal-sm focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-4 border-black bg-zinc-950 p-4 space-y-4 animate-in slide-in-from-top-5 duration-200">
          <div className="space-y-2">
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

          <div className="border-t-2 border-zinc-800 pt-4">
            {isLoading ? (
              <div className="h-10 w-full bg-zinc-900 animate-pulse rounded-xl border-2 border-black" />
            ) : user ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-zinc-900 rounded-xl border-2 border-black">
                  <p className="text-sm font-black text-zinc-100 truncate">
                    {user.profile?.name || 'Founder'}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                </div>
                
                <Link
                  href="/launch"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#ffe600] text-zinc-950 border-2 border-black font-black uppercase text-xs tracking-wider rounded-xl shadow-brutal-sm"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Pitch a Meme</span>
                </Link>

                <Link
                  href="/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-zinc-200 bg-zinc-900 border-2 border-black rounded-xl font-bold uppercase text-xs"
                >
                  <BarChart3 className="h-5 w-5 text-[#ffe600]" />
                  <span>Analytics</span>
                </Link>

                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-zinc-200 bg-zinc-900 border-2 border-black rounded-xl font-bold uppercase text-xs"
                >
                  <User className="h-5 w-5 text-zinc-400" />
                  <span>My Profile</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 text-rose-400 bg-zinc-900 border-2 border-black rounded-xl font-bold uppercase text-xs text-left"
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
                  className="flex items-center justify-center py-3 bg-zinc-900 border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider text-zinc-200 shadow-brutal-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 bg-[#ffe600] text-zinc-950 border-2 border-black font-black uppercase text-xs tracking-wider rounded-xl shadow-brutal-sm"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Pitch</span>
                </Link>
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
