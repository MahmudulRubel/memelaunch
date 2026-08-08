# Mobile Menu Redesign Implementation Plan (Option 1: Glassmorphism Slide Sheet)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Option 1 (Sleek Glassmorphism Mobile Overlay Sheet with Premium Micro-Interactions) in `components/navigation.tsx` for mobile viewports (< 768px).

**Architecture:** Refactor `components/navigation.tsx` mobile menu markup to render translucent glass card rows with gradient borders, subtext descriptions, glowing yellow points badges, standout pitch CTA, and backdrop blur overlay.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React icons.

## Global Constraints
- Target File: `components/navigation.tsx`
- Maintain all existing state hooks (`user`, `userPoints`, `mobileMenuOpen`, `isPointsModalOpen`, `signOut`).
- Ensure navigation links close the mobile menu on click (`setMobileMenuOpen(false)`).

---

### Task 1: Implement Glassmorphism Mobile Drawer in `components/navigation.tsx`

**Files:**
- Modify: [components/navigation.tsx](file:///d:/memelaunch/components/navigation.tsx)

- [ ] **Step 1: Expand NavLinks array to include subtext descriptions**

In `components/navigation.tsx`:
```tsx
const navLinks = [
  { name: 'Feed', href: '/', icon: Compass, description: 'Explore & upvote trending pitches' },
  { name: 'Templates', href: '/templates', icon: LayoutGrid, description: 'Browse popular meme canvases' },
  { name: 'Rules', href: '/rules', icon: Settings, description: 'Platform guidelines & pitch rules' },
];
```

- [ ] **Step 2: Replace Mobile Menu Dropdown with Glassmorphism Overlay Sheet**

Update the mobile menu JSX in `components/navigation.tsx`:
```tsx
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
```

- [ ] **Step 3: Run Typecheck**

Run `npx tsc --noEmit` to verify 0 errors.

---
