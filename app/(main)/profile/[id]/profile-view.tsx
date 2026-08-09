'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { insforge, resolveStorageUrl, getCategoryBadgeStyle, uploadImageToStorage } from '@/lib/insforge';
import { MemeCard, type Launch } from '@/components/feed/meme-card';
import {
  User,
  Calendar,
  Sparkles,
  Trophy,
  Share2,
  Download,
  Edit3,
  Check,
  X,
  Plus,
  Flame,
  Loader2,
  AlertCircle,
  Camera,
  BarChart3,
  Rocket,
  Settings as SettingsIcon,
  Globe,
  ExternalLink,
  Eye,
  MousePointerClick,
  TrendingUp,
  Bell,
  CreditCard,
  ShieldCheck,
  Sliders,
  LogOut,
  Copy,
  CheckCircle2,
  Layers,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface ProfileData {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  twitter_handle?: string | null;
  github_handle?: string | null;
  website_url?: string | null;
}

interface ProfileViewProps {
  profileId: string;
  initialProfile: ProfileData | null;
  initialLaunches: Launch[];
}

type TabType = 'products' | 'analytics' | 'maker' | 'settings';

export default function ProfileView({ profileId, initialProfile, initialLaunches }: ProfileViewProps) {
  const router = useRouter();
  const { user, refreshUser, signOut } = useAuth();

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>('products');

  // Profile data state
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [launches, setLaunches] = useState<Launch[]>(initialLaunches || []);
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Products tab filter: 'all' | 'live' | 'pending'
  const [productFilter, setProductFilter] = useState<'all' | 'live' | 'pending'>('all');

  // Edit Profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialProfile?.name || '');
  const [editBio, setEditBio] = useState(initialProfile?.bio || '');
  const [editAvatar, setEditAvatar] = useState(initialProfile?.avatar || '');
  const [editTwitter, setEditTwitter] = useState(initialProfile?.twitter_handle || '');
  const [editGithub, setEditGithub] = useState(initialProfile?.github_handle || '');
  const [editWebsite, setEditWebsite] = useState(initialProfile?.website_url || '');

  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings Toggles State
  const [notifications, setNotifications] = useState({
    emailOnUpvote: true,
    emailOnApproval: true,
    weeklyDigest: true,
    announcements: false,
  });
  const [saveToast, setSaveToast] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Canvas share card generation state
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  // Account Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm deletion.');
      return;
    }
    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profileId, confirmationText: deleteConfirmInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');

      await signOut();
      router.push('/');
    } catch (err: any) {
      alert(err.message || 'Error deleting account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Load notification preferences & social links from localStorage if available
    try {
      const savedNotifs = localStorage.getItem(`memelaunch_notifs_${profileId}`);
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }

      const savedSocials = localStorage.getItem(`memelaunch_socials_${profileId}`);
      if (savedSocials) {
        const parsed = JSON.parse(savedSocials);
        setEditTwitter(parsed.twitter || '');
        setEditGithub(parsed.github || '');
        setEditWebsite(parsed.website || '');
        setProfile((prev) => prev ? {
          ...prev,
          twitter_handle: prev.twitter_handle || parsed.twitter || null,
          github_handle: prev.github_handle || parsed.github || null,
          website_url: prev.website_url || parsed.website || null,
        } : null);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [profileId]);

  // Is this the user's own profile?
  const isOwnProfile = user?.id === profileId;

  // Sync / load all own launches (including unapproved) on mount
  useEffect(() => {
    if (user && user.id === profileId) {
      const fetchOwnLaunches = async () => {
        try {
          const { data, error } = await insforge.database
            .from('launches')
            .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
            .eq('user_id', profileId)
            .order('created_at', { ascending: false });
          if (!error && data) {
            setLaunches(data as Launch[]);
          }
        } catch (e) {
          console.error('Failed to fetch own launches:', e);
        }
      };
      fetchOwnLaunches();
    }
  }, [user, profileId]);

  // Fetch full profile and launches
  const fetchProfileAndLaunches = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const launchesQuery = insforge.database
        .from('launches')
        .select('*, users(name, avatar), reactions(emoji_type, user_id), comments(id)')
        .eq('user_id', profileId);

      const [
        { data: profileData, error: profileErr },
        { data: launchesData, error: launchesErr }
      ] = await Promise.all([
        insforge.database
          .from('users')
          .select('*')
          .eq('id', profileId)
          .single(),
        (user?.id !== profileId ? launchesQuery.eq('is_approved', true) : launchesQuery)
          .order('created_at', { ascending: false })
      ]);

      if (profileErr || !profileData) {
        throw new Error(profileErr?.message || 'Founder profile not found.');
      }

      let localSocials: any = {};
      try {
        const savedSocials = localStorage.getItem(`memelaunch_socials_${profileId}`);
        if (savedSocials) localSocials = JSON.parse(savedSocials);
      } catch (e) {}

      const finalTwitter = profileData.twitter_handle || localSocials.twitter || null;
      const finalGithub = profileData.github_handle || localSocials.github || null;
      const finalWebsite = profileData.website_url || localSocials.website || null;

      setProfile({
        ...profileData,
        twitter_handle: finalTwitter,
        github_handle: finalGithub,
        website_url: finalWebsite,
      } as ProfileData);

      setEditName(profileData.name || '');
      setEditBio(profileData.bio || '');
      setEditAvatar(profileData.avatar || '');
      setEditTwitter(finalTwitter || '');
      setEditGithub(finalGithub || '');
      setEditWebsite(finalWebsite || '');

      if (launchesErr) {
        console.error('Error fetching founder launches:', launchesErr);
      } else {
        setLaunches((launchesData || []) as Launch[]);
      }
    } catch (err: any) {
      console.error('Failed to load profile context:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Products filtering
  const liveLaunches = useMemo(() => {
    return launches.filter((l) => l.is_approved !== false);
  }, [launches]);

  const pendingLaunches = useMemo(() => {
    return launches.filter((l) => l.is_approved === false);
  }, [launches]);

  const filteredLaunches = useMemo(() => {
    if (productFilter === 'live') return liveLaunches;
    if (productFilter === 'pending') return pendingLaunches;
    return launches;
  }, [launches, liveLaunches, pendingLaunches, productFilter]);

  // Statistics calculation across launches
  const stats = useMemo(() => {
    const totalLaunches = launches.length;
    const totalLiveLaunches = liveLaunches.length;
    const totalPendingLaunches = pendingLaunches.length;
    
    let totalReactions = 0;
    let totalViews = 0;
    let totalClicks = 0;

    launches.forEach((launch: any) => {
      totalReactions += launch.reactions?.length || 0;
      totalViews += launch.views_count || 0;
      totalClicks += launch.clicks_count || 0;
    });

    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

    return {
      totalLaunches,
      totalLiveLaunches,
      totalPendingLaunches,
      totalReactions,
      totalViews,
      totalClicks,
      ctr,
    };
  }, [launches, liveLaunches, pendingLaunches]);

  // Achievements evaluation
  const achievements = useMemo(() => {
    return [
      {
        id: 'meme-pioneer',
        title: 'Meme Pioneer',
        description: 'Successfully launched your first meme-native product.',
        icon: Sparkles,
        color: 'text-[#ffe600] border-[#ffe600]/40 bg-[#ffe600]/10 shadow-brutal-sm',
        unlocked: stats.totalLaunches >= 1,
        requirement: '1 Launch required',
      },
      {
        id: 'arena-veteran',
        title: 'Arena Veteran',
        description: 'Consistent builder with 3 or more product launches.',
        icon: Trophy,
        color: 'text-cyan-400 border-cyan-400/40 bg-cyan-950/20 shadow-brutal-sm',
        unlocked: stats.totalLaunches >= 3,
        requirement: '3 Launches required',
      },
      {
        id: 'reaction-magnet',
        title: 'Reaction Magnet',
        description: 'Fired up the arena and gathered 10+ community reactions.',
        icon: Flame,
        color: 'text-rose-400 border-rose-400/40 bg-rose-950/20 shadow-brutal-sm',
        unlocked: stats.totalReactions >= 10,
        requirement: '10 Reactions received',
      },
    ];
  }, [stats]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Save profile updates (bio, social links, portfolio, avatar)
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      let finalAvatarUrl = editAvatar;

      // 1. Upload new avatar if selected
      if (avatarFile) {
        const fileExtension = avatarFile.name.split('.').pop() || 'jpg';
        const avatarPath = `${profileId}/${Date.now()}_avatar.${fileExtension}`;
        
        finalAvatarUrl = await uploadImageToStorage(avatarFile, 'avatars', avatarPath);
      }

      // Save social links to localStorage as backup
      try {
        localStorage.setItem(`memelaunch_socials_${profileId}`, JSON.stringify({
          twitter: editTwitter.trim(),
          github: editGithub.trim(),
          website: editWebsite.trim(),
        }));
      } catch (e) {}

      // 2. Try updating users table row with extra social fields
      let { error: updateError } = await insforge.database
        .from('users')
        .update({
          name: editName.trim(),
          bio: editBio.trim(),
          avatar: finalAvatarUrl,
          twitter_handle: editTwitter.trim() || null,
          github_handle: editGithub.trim() || null,
          website_url: editWebsite.trim() || null,
        })
        .eq('id', profileId);

      // If DB schema doesn't have twitter_handle/github_handle/website_url columns yet (PGRST204), fallback to core columns
      if (updateError && (updateError.code === 'PGRST204' || updateError.message?.includes('schema cache') || updateError.message?.includes('column'))) {
        console.warn('Social columns not found in database schema cache, performing core columns update fallback...');
        const fallbackRes = await insforge.database
          .from('users')
          .update({
            name: editName.trim(),
            bio: editBio.trim(),
            avatar: finalAvatarUrl,
          })
          .eq('id', profileId);

        updateError = fallbackRes.error;
      }

      if (updateError) {
        throw updateError;
      }

      // 3. Refresh Auth provider state
      await refreshUser();
      
      // Update local profile state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: editName.trim(),
              bio: editBio.trim(),
              avatar: finalAvatarUrl,
              twitter_handle: editTwitter.trim() || null,
              github_handle: editGithub.trim() || null,
              website_url: editWebsite.trim() || null,
            }
          : null
      );
      
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
      
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle notification preferences
  const handleToggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      localStorage.setItem(`memelaunch_notifs_${profileId}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Copy User ID to clipboard
  const handleCopyUserId = () => {
    if (profile?.id) {
      navigator.clipboard.writeText(profile.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Compile Share Card as Watermarked Image Download
  const handleDownloadShareCard = async () => {
    if (!profile || isGeneratingCard) return;
    setIsGeneratingCard(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas ref missing');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context missing');

      canvas.width = 800;
      canvas.height = 450;

      // 1. Draw Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 450);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#18181b');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 450);

      // 2. Draw border
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 780, 430);

      const drawProfileAvatar = (): Promise<void> => {
        return new Promise((resolve) => {
          if (!profile.avatar) {
            drawFallbackAvatar();
            resolve();
            return;
          }

          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              ctx.save();
              ctx.beginPath();
              ctx.arc(100, 110, 50, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, 50, 60, 100, 100);
              ctx.restore();
              
              ctx.strokeStyle = '#ffe600';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(100, 110, 50, 0, Math.PI * 2);
              ctx.stroke();
            } catch (e) {
              drawFallbackAvatar();
            }
            resolve();
          };

          img.onerror = () => {
            drawFallbackAvatar();
            resolve();
          };

          img.src = resolveStorageUrl(profile.avatar);
        });
      };

      const drawFallbackAvatar = () => {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(100, 110, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(100, 110, 50, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffe600';
        ctx.font = 'bold 42px Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const letter = profile.name ? profile.name[0].toUpperCase() : 'F';
        ctx.fillText(letter, 100, 110);
      };

      await drawProfileAvatar();

      // 3. User Details
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      ctx.fillStyle = '#fafafa';
      ctx.font = 'bold 32px Impact, sans-serif';
      ctx.fillText((profile.name || 'Founder').toUpperCase(), 170, 75);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '16px sans-serif';
      const bioText = profile.bio || 'MemeLaunch founder cooking something special.';
      const words = bioText.split(' ');
      let line = '';
      let y = 120;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 550 && n > 0) {
          ctx.fillText(line, 170, y);
          line = words[n] + ' ';
          y += 24;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 170, y);

      // 4. Stats Cards
      const drawStat = (label: string, value: string | number, x: number) => {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x, 220, 180, 100);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, 220, 180, 100);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe600';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(value.toString(), x + 90, 235);
        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(label.toUpperCase(), x + 90, 285);
      };

      drawStat('Launches', stats.totalLaunches, 180);
      drawStat('Vibe Reactions', stats.totalReactions, 440);

      // 5. Watermarks
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffe600';
      ctx.font = 'bold 24px Impact, sans-serif';
      ctx.fillText('🚀 MEMELAUNCH', 50, 380);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px monospace';
      ctx.fillText('FUN HOOKS. SERIOUS DETAILS.', 220, 385);

      const unlockedCount = achievements.filter((a) => a.unlocked).length;
      let rankName = 'Meme Recruit';
      if (unlockedCount === 3) rankName = 'Meme Deity';
      else if (unlockedCount === 2) rankName = 'Arena Master';
      else if (unlockedCount === 1) rankName = 'Meme Pioneer';

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffe600';
      ctx.font = 'bold 14px Impact, sans-serif';
      ctx.fillText(`RANK: ${rankName.toUpperCase()}`, 750, 385);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${profile.name || 'founder'}_memelaunch_stats.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to compile card:', err);
      alert('Failed to generate sharing card.');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const shareToXUrl = useMemo(() => {
    if (!profile) return '';
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    let rankName = 'Meme Recruit';
    if (unlockedCount === 3) rankName = 'Meme Deity';
    else if (unlockedCount === 2) rankName = 'Arena Master';
    else if (unlockedCount === 1) rankName = 'Meme Pioneer';

    const text = `🔥 Check out my Founder Stats on @launchme_me! 🚀\n\n🎯 Launches: ${stats.totalLaunches}\n⚡ Reactions: ${stats.totalReactions}\n🏅 Rank: ${rankName}\n\nJoin the chaos of meme-native product discovery! 👾👇\n`;
    const shareUrl = mounted && typeof window !== 'undefined' ? window.location.href : `https://memelaunch.app/profile/${profileId}`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  }, [profile, stats, achievements, profileId, mounted]);

  const formattedJoinedDate = useMemo(() => {
    if (!profile?.created_at) return '';
    const date = new Date(profile.created_at);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }, [profile?.created_at]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-[#ffe600] animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Decoding founder telemetry & profiles...</p>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900 border-4 border-black rounded-3xl text-center space-y-4 max-w-lg mx-auto shadow-brutal">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h3 className="text-lg font-black text-zinc-100 uppercase tracking-wide">Founder Profile Unavailable</h3>
        <p className="text-zinc-400 text-sm">{errorMsg || 'This developer is hiding in the shadows.'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 bg-[#ffe600] text-zinc-950 border-2 border-black rounded-xl hover:bg-yellow-300 font-black uppercase text-xs tracking-wider shadow-brutal-sm"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <canvas ref={canvasRef} className="hidden" />

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#ffe600] text-zinc-950 px-4 py-3 rounded-2xl border-4 border-black font-black uppercase text-xs shadow-brutal animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-5 w-5 stroke-[3]" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Founder Profile Banner Header */}
      <section className="relative overflow-hidden rounded-[32px] border-4 border-black bg-zinc-900/90 p-6 md:p-8 shadow-brutal">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-[#ffe600]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-zinc-950 border-4 border-black group-hover:border-[#ffe600] transition-all flex items-center justify-center font-impact text-3xl uppercase text-[#ffe600] overflow-hidden shadow-brutal-sm">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="New avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : profile.avatar ? (
                  <Image
                    src={resolveStorageUrl(profile.avatar)}
                    alt={profile.name || 'Founder'}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.name ? profile.name[0].toUpperCase() : '?'
                )}
              </div>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 rounded-full transition-all border-2 border-black shadow-brutal-sm cursor-pointer"
                  title="Upload New Avatar"
                >
                  <Camera className="h-4 w-4 stroke-[3]" />
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name, Bio & Social Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="font-impact text-3xl md:text-4xl uppercase tracking-tight text-zinc-100">
                  {profile.name || 'Founder'}
                </h1>
                
                {isOwnProfile && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#ffe600] text-zinc-950 border-2 border-black text-[10px] font-black tracking-wider uppercase shadow-brutal-sm">
                    YOU
                  </span>
                )}

                {isOwnProfile && user?.emailVerified && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="h-3 w-3 stroke-[2.5]" />
                    Verified Email
                  </span>
                )}
              </div>

              <p className="text-zinc-300 text-sm max-w-md italic font-medium leading-relaxed">
                {profile.bio || 'This founder hasn\'t typed their bio yet. Probably too busy polishing memes.'}
              </p>

              {/* Social & Portfolio Badges Header Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                  <Calendar className="h-3.5 w-3.5 text-[#ffe600]" />
                  <span>Joined {formattedJoinedDate}</span>
                </div>

                {profile.twitter_handle && (
                  <a
                    href={profile.twitter_handle.startsWith('http') ? profile.twitter_handle : `https://x.com/${profile.twitter_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-300 hover:text-[#ffe600] hover:border-[#ffe600] transition-colors font-mono text-[11px]"
                  >
                    <XIcon className="h-3 w-3 fill-current" />
                    <span>{profile.twitter_handle.startsWith('@') ? profile.twitter_handle : `@${profile.twitter_handle}`}</span>
                  </a>
                )}

                {profile.github_handle && (
                  <a
                    href={profile.github_handle.startsWith('http') ? profile.github_handle : `https://github.com/${profile.github_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-300 hover:text-[#ffe600] hover:border-[#ffe600] transition-colors font-mono text-[11px]"
                  >
                    <GithubIcon className="h-3 w-3" />
                    <span>{profile.github_handle}</span>
                  </a>
                )}

                {profile.website_url && (
                  <a
                    href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-300 hover:text-[#ffe600] hover:border-[#ffe600] transition-colors font-mono text-[11px]"
                  >
                    <Globe className="h-3 w-3" />
                    <span>{profile.website_url.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isOwnProfile && (
              <button
                onClick={() => {
                  setActiveTab('maker');
                  setIsEditing(true);
                }}
                className="px-4 py-2.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="h-4 w-4 stroke-[3]" />
                <span>Edit Profile</span>
              </button>
            )}

            <a
              href={shareToXUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border-2 border-black text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="h-4 w-4 text-cyan-400" />
              <span>Share to X</span>
            </a>

            <button
              onClick={handleDownloadShareCard}
              disabled={isGeneratingCard}
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border-2 border-black text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingCard ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#ffe600]" />
              ) : (
                <Download className="h-4 w-4 text-[#ffe600]" />
              )}
              <span>Stats Card</span>
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <nav className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/60 p-2 border-4 border-black rounded-3xl shadow-brutal">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
            activeTab === 'products'
              ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm font-black'
              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-black hover:bg-zinc-900 font-bold'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-sm uppercase tracking-wider flex items-center gap-2 font-black">
              <Rocket className="h-4 w-4 stroke-[3]" />
              <span>My Products</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              activeTab === 'products' ? 'bg-zinc-950 text-[#ffe600] border-black font-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              {launches.length}
            </span>
          </div>
          <span className={`text-[11px] leading-tight ${activeTab === 'products' ? 'text-zinc-900 font-semibold' : 'text-zinc-400 font-medium'}`}>
            Launches, drafts & updates
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
            activeTab === 'analytics'
              ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm font-black'
              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-black hover:bg-zinc-900 font-bold'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-sm uppercase tracking-wider flex items-center gap-2 font-black">
              <BarChart3 className="h-4 w-4 stroke-[3]" />
              <span>Analytics</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              activeTab === 'analytics' ? 'bg-zinc-950 text-[#ffe600] border-black font-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              {stats.totalViews} views
            </span>
          </div>
          <span className={`text-[11px] leading-tight ${activeTab === 'analytics' ? 'text-zinc-900 font-semibold' : 'text-zinc-400 font-medium'}`}>
            Track upvotes, views & conversion
          </span>
        </button>

        <button
          onClick={() => setActiveTab('maker')}
          className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
            activeTab === 'maker'
              ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm font-black'
              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-black hover:bg-zinc-900 font-bold'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-sm uppercase tracking-wider flex items-center gap-2 font-black">
              <User className="h-4 w-4 stroke-[3]" />
              <span>Maker Profile</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              activeTab === 'maker' ? 'bg-zinc-950 text-[#ffe600] border-black font-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              Bio & Links
            </span>
          </div>
          <span className={`text-[11px] leading-tight ${activeTab === 'maker' ? 'text-zinc-900 font-semibold' : 'text-zinc-400 font-medium'}`}>
            Bio, social links & portfolio
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
            activeTab === 'settings'
              ? 'bg-[#ffe600] text-zinc-950 border-black shadow-brutal-sm font-black'
              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-black hover:bg-zinc-900 font-bold'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-sm uppercase tracking-wider flex items-center gap-2 font-black">
              <SettingsIcon className="h-4 w-4 stroke-[3]" />
              <span>Settings</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              activeTab === 'settings' ? 'bg-zinc-950 text-[#ffe600] border-black font-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              Account
            </span>
          </div>
          <span className={`text-[11px] leading-tight ${activeTab === 'settings' ? 'text-zinc-900 font-semibold' : 'text-zinc-400 font-medium'}`}>
            Billing, notifications & prefs
          </span>
        </button>
      </nav>

      {/* TAB 1: MY PRODUCTS */}
      {activeTab === 'products' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
            <div>
              <h2 className="text-2xl font-impact uppercase tracking-tight text-zinc-100 flex items-center gap-2">
                <Rocket className="h-6 w-6 text-[#ffe600]" />
                <span>My Products ({launches.length})</span>
              </h2>
              <p className="text-zinc-400 text-xs font-semibold">Manage your meme product pitches, live listings, and pending approval drafts.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 border-2 border-black rounded-xl shadow-brutal-sm">
                <button
                  onClick={() => setProductFilter('all')}
                  className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                    productFilter === 'all' ? 'bg-[#ffe600] text-zinc-950 border border-black' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All ({launches.length})
                </button>
                <button
                  onClick={() => setProductFilter('live')}
                  className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                    productFilter === 'live' ? 'bg-emerald-400 text-zinc-950 border border-black' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Live ({liveLaunches.length})
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setProductFilter('pending')}
                    className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                      productFilter === 'pending' ? 'bg-amber-400 text-zinc-950 border border-black' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Drafts ({pendingLaunches.length})
                  </button>
                )}
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => router.push('/launch')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Pitch a Meme</span>
                </button>
              )}
            </div>
          </div>

          {filteredLaunches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900 border-4 border-black rounded-3xl text-center space-y-4 max-w-md mx-auto shadow-brutal">
              <Rocket className="h-12 w-12 text-zinc-600" />
              <h3 className="text-lg font-black text-zinc-200 uppercase">No products match this filter</h3>
              <p className="text-zinc-400 text-xs font-mono">
                {productFilter === 'pending'
                  ? 'You have 0 pending approval drafts. All your launches are currently live!'
                  : 'This founder hasn\'t launched any products matching this section.'}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => router.push('/launch')}
                  className="px-5 py-2.5 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl border-2 border-black shadow-brutal-sm cursor-pointer"
                >
                  Deploy First Meme Product
                </button>
              )}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredLaunches.map((launch) => (
                <MemeCard
                  key={launch.id}
                  launch={launch}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          {/* Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-zinc-900 border-4 border-black rounded-3xl shadow-brutal">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-[#ffe600]" />
                <h2 className="text-2xl font-impact uppercase tracking-tight text-zinc-100">
                  Performance Telemetry Overview
                </h2>
              </div>
              <p className="text-zinc-300 text-xs font-semibold">
                Track real-time upvotes, product detail page views, link clicks, and conversion rates across your live launches.
              </p>
            </div>

            <button
              onClick={() => router.push('/analytics')}
              className="flex items-center gap-2 px-5 py-3 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl border-2 border-black shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Open Full Analytics Dashboard</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-zinc-900 border-4 border-black rounded-2xl shadow-brutal flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Live Products</span>
                <Rocket className="h-5 w-5 text-[#ffe600]" />
              </div>
              <div>
                <span className="text-4xl font-black text-zinc-100 font-mono">{stats.totalLiveLaunches}</span>
                <p className="text-[11px] text-zinc-400 mt-1 font-semibold">Approved & searchable</p>
              </div>
            </div>

            <div className="p-5 bg-zinc-900 border-4 border-black rounded-2xl shadow-brutal flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Total Upvotes</span>
                <Flame className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <span className="text-4xl font-black text-rose-400 font-mono">{stats.totalReactions}</span>
                <p className="text-[11px] text-zinc-400 mt-1 font-semibold">Vibe reactions received</p>
              </div>
            </div>

            <div className="p-5 bg-zinc-900 border-4 border-black rounded-2xl shadow-brutal flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Product Views</span>
                <Eye className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-4xl font-black text-cyan-400 font-mono">{stats.totalViews}</span>
                <p className="text-[11px] text-zinc-400 mt-1 font-semibold">Page impressions</p>
              </div>
            </div>

            <div className="p-5 bg-zinc-900 border-4 border-black rounded-2xl shadow-brutal flex flex-col justify-between h-36">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Link Clicks (CTR)</span>
                <MousePointerClick className="h-5 w-5 text-[#ffe600]" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#ffe600] font-mono">{stats.totalClicks}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">({stats.ctr}%)</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-semibold">Outbound website conversions</p>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-zinc-900 border-4 border-black rounded-3xl p-6 shadow-brutal space-y-4">
            <h3 className="text-lg font-black uppercase text-zinc-100 flex items-center gap-2 border-b-2 border-zinc-800 pb-3">
              <TrendingUp className="h-5 w-5 text-[#ffe600]" />
              <span>Product Conversion & Telemetry Breakdown</span>
            </h3>

            {launches.length === 0 ? (
              <p className="text-zinc-400 text-sm italic py-4 text-center font-mono">No telemetry data recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Product Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Upvotes</th>
                      <th className="py-3 px-3 text-center">Views</th>
                      <th className="py-3 px-3 text-center">Clicks</th>
                      <th className="py-3 px-3 text-center">CTR %</th>
                      <th className="py-3 px-3 text-right">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {launches.map((launch: any) => {
                      const reactionsCount = launch.reactions?.length || 0;
                      const views = launch.views_count || 0;
                      const clicks = launch.clicks_count || 0;
                      const itemCtr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={launch.id} className="hover:bg-zinc-950/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-zinc-100 flex items-center gap-2">
                            <span>{launch.product_name}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getCategoryBadgeStyle(launch.category)}`}>
                              {launch.category}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {launch.is_approved !== false ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-400 text-zinc-950 font-black text-[10px] uppercase border border-black">
                                LIVE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-black text-[10px] uppercase border border-black">
                                PENDING
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-rose-400">{reactionsCount} 🔥</td>
                          <td className="py-3 px-3 text-center font-bold text-cyan-400">{views} 👁️</td>
                          <td className="py-3 px-3 text-center font-bold text-[#ffe600]">{clicks} 🔗</td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-400">{itemCtr}%</td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/products/${encodeURIComponent(launch.product_name.toLowerCase().replace(/\s+/g, '-'))}`}
                              className="text-[#ffe600] hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: MAKER PROFILE */}
      {activeTab === 'maker' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b-4 border-black pb-4">
            <div>
              <h2 className="text-2xl font-impact uppercase tracking-tight text-zinc-100 flex items-center gap-2">
                <User className="h-6 w-6 text-[#ffe600]" />
                <span>Maker Profile & Portfolio</span>
              </h2>
              <p className="text-zinc-400 text-xs font-semibold">Update your bio, social handles, and portfolio links for community discovery.</p>
            </div>

            {isOwnProfile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#ffe600] hover:bg-yellow-300 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-xl border-2 border-black shadow-brutal-sm cursor-pointer"
              >
                <Edit3 className="h-4 w-4 stroke-[3]" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {isEditing && isOwnProfile ? (
            /* Editable Form */
            <div className="bg-zinc-900 border-4 border-black rounded-3xl p-6 shadow-brutal space-y-6 max-w-2xl">
              <h3 className="text-lg font-black uppercase text-zinc-100 border-b-2 border-zinc-800 pb-3 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[#ffe600]" />
                <span>Update Profile Details</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Satoshi Nakameme"
                    className="w-full px-4 py-2.5 bg-zinc-950 border-2 border-black rounded-xl text-sm focus:outline-none focus:border-[#ffe600] text-zinc-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                    Bio / Pitch
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell the community what awesome tools or memes you are building..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-zinc-950 border-2 border-black rounded-xl text-xs focus:outline-none focus:border-[#ffe600] text-zinc-200 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <XIcon className="h-3.5 w-3.5 text-cyan-400" />
                      <span>X / Twitter Handle</span>
                    </label>
                    <input
                      type="text"
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      placeholder="@yourhandle"
                      className="w-full px-3.5 py-2 bg-zinc-950 border-2 border-black rounded-xl text-xs focus:outline-none focus:border-[#ffe600] text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <GithubIcon className="h-3.5 w-3.5 text-zinc-100" />
                      <span>GitHub Username</span>
                    </label>
                    <input
                      type="text"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      placeholder="github-username"
                      className="w-full px-3.5 py-2 bg-zinc-950 border-2 border-black rounded-xl text-xs focus:outline-none focus:border-[#ffe600] text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-[#ffe600]" />
                    <span>Portfolio / Personal Website URL</span>
                  </label>
                  <input
                    type="url"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-3.5 py-2 bg-zinc-950 border-2 border-black rounded-xl text-xs focus:outline-none focus:border-[#ffe600] text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t-2 border-zinc-800">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#ffe600] hover:bg-yellow-300 disabled:opacity-50 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-brutal-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[3]" />}
                  <span>Save Profile</span>
                </button>

                <button
                  onClick={() => {
                    setAvatarPreview(null);
                    setAvatarFile(null);
                    setIsEditing(false);
                  }}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl border-2 border-black cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Details Card */}
              <div className="md:col-span-2 bg-zinc-900 border-4 border-black rounded-3xl p-6 shadow-brutal space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#ffe600] mb-1 font-mono">
                    Maker Bio
                  </h3>
                  <p className="text-zinc-200 text-sm font-medium leading-relaxed bg-zinc-950 p-4 border-2 border-black rounded-2xl italic">
                    "{profile.bio || 'No bio provided yet.'}"
                  </p>
                </div>

                {/* Social & Portfolio Links Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">
                    Verified Socials & Portfolio
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-zinc-950 border-2 border-black rounded-xl flex items-center gap-3">
                      <XIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Twitter / X</span>
                        {profile.twitter_handle ? (
                          <a
                            href={profile.twitter_handle.startsWith('http') ? profile.twitter_handle : `https://x.com/${profile.twitter_handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-zinc-200 hover:text-[#ffe600] truncate block"
                          >
                            {profile.twitter_handle}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-600 italic">Not set</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950 border-2 border-black rounded-xl flex items-center gap-3">
                      <GithubIcon className="h-5 w-5 text-zinc-100 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">GitHub</span>
                        {profile.github_handle ? (
                          <a
                            href={profile.github_handle.startsWith('http') ? profile.github_handle : `https://github.com/${profile.github_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-zinc-200 hover:text-[#ffe600] truncate block"
                          >
                            {profile.github_handle}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-600 italic">Not set</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950 border-2 border-black rounded-xl flex items-center gap-3">
                      <Globe className="h-5 w-5 text-[#ffe600] flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Portfolio</span>
                        {profile.website_url ? (
                          <a
                            href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-zinc-200 hover:text-[#ffe600] truncate block"
                          >
                            {profile.website_url.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-600 italic">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements Sidebar */}
              <div className="bg-zinc-900 border-4 border-black rounded-3xl p-6 shadow-brutal space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-zinc-800 pb-3">
                  <Trophy className="h-5 w-5 text-[#ffe600]" />
                  <h3 className="text-sm font-black uppercase text-zinc-100">Founder Badges</h3>
                </div>

                <div className="space-y-3">
                  {achievements.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.id}
                        className={`p-3.5 border-2 rounded-2xl flex items-start gap-3 transition-all ${
                          badge.unlocked
                            ? 'bg-zinc-950 border-black shadow-brutal-sm'
                            : 'bg-zinc-950/40 border-zinc-800/80 opacity-40 select-none'
                        }`}
                      >
                        <div className={`p-2 rounded-xl border ${badge.unlocked ? 'border-black bg-[#ffe600] text-zinc-950 font-black' : 'border-zinc-800 bg-zinc-900 text-zinc-600'}`}>
                          <Icon className="h-4 w-4 stroke-[3]" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-zinc-100">{badge.title}</h4>
                          <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{badge.description}</p>
                          <span className="text-[9px] font-mono text-zinc-500 block mt-1 uppercase font-bold">
                            {badge.requirement} • {badge.unlocked ? '✓ UNLOCKED' : 'LOCKED'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <section className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
          <div className="border-b-4 border-black pb-4">
            <h2 className="text-2xl font-impact uppercase tracking-tight text-zinc-100 flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-[#ffe600]" />
              <span>Account & App Settings</span>
            </h2>
            <p className="text-zinc-400 text-xs font-semibold">Manage your plan billing, email notifications, and developer preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Billing & Subscription */}
            <div className="bg-zinc-900 border-4 border-black rounded-3xl p-6 shadow-brutal space-y-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#ffe600]" />
                  <h3 className="text-base font-black uppercase text-zinc-100">Billing & Tier</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#ffe600] text-zinc-950 font-black text-[10px] uppercase border-2 border-black">
                  MAKER FREE TIER
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  You are currently on the <span className="font-bold text-[#ffe600]">Maker Free Tier</span>. Enjoy pitching unlimited meme products and tracking real-time telemetry!
                </p>

                <div className="p-3 bg-zinc-950 border-2 border-black rounded-2xl space-y-1.5 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    <span>Unlimited Meme Product Pitches</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    <span>Real-time Product Telemetry</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    <span>Community Founder Badges</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('You are already enjoying full free access to MemeLaunch!')}
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border-2 border-black rounded-xl text-xs font-black uppercase text-zinc-200 tracking-wider transition-all shadow-brutal-sm cursor-pointer"
                >
                  Manage Billing & Subscription
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-zinc-900 border-4 border-black rounded-3xl p-6 shadow-brutal space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-zinc-800 pb-3">
                <Bell className="h-5 w-5 text-[#ffe600]" />
                <h3 className="text-base font-black uppercase text-zinc-100">Notification Preferences</h3>
              </div>

              <div className="space-y-3 text-xs font-bold">
                <label className="flex items-center justify-between p-3 bg-zinc-950 border-2 border-black rounded-xl cursor-pointer hover:bg-zinc-900/60 transition-colors">
                  <span className="text-zinc-200">Email on product upvote/reaction</span>
                  <input
                    type="checkbox"
                    checked={notifications.emailOnUpvote}
                    onChange={() => handleToggleNotification('emailOnUpvote')}
                    className="h-4 w-4 accent-[#ffe600] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-zinc-950 border-2 border-black rounded-xl cursor-pointer hover:bg-zinc-900/60 transition-colors">
                  <span className="text-zinc-200">Email when launch status is approved</span>
                  <input
                    type="checkbox"
                    checked={notifications.emailOnApproval}
                    onChange={() => handleToggleNotification('emailOnApproval')}
                    className="h-4 w-4 accent-[#ffe600] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-zinc-950 border-2 border-black rounded-xl cursor-pointer hover:bg-zinc-900/60 transition-colors">
                  <span className="text-zinc-200">Weekly performance digest email</span>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={() => handleToggleNotification('weeklyDigest')}
                    className="h-4 w-4 accent-[#ffe600] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-zinc-950 border-2 border-black rounded-xl cursor-pointer hover:bg-zinc-900/60 transition-colors">
                  <span className="text-zinc-200">Community updates & product announcements</span>
                  <input
                    type="checkbox"
                    checked={notifications.announcements}
                    onChange={() => handleToggleNotification('announcements')}
                    className="h-4 w-4 accent-[#ffe600] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Account Details & Danger Zone */}
          <div className="bg-zinc-900 border-4 border-black rounded-3xl p-6 shadow-brutal space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-zinc-800 pb-3">
              <ShieldCheck className="h-5 w-5 text-[#ffe600]" />
              <h3 className="text-base font-black uppercase text-zinc-100">Account Credentials & System Info</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-zinc-950 border-2 border-black rounded-xl">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Account Email</span>
                <span className="text-zinc-200 font-bold">{user?.email || 'N/A'}</span>
              </div>

              <div className="p-3 bg-zinc-950 border-2 border-black rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Founder User ID</span>
                  <span className="text-zinc-300 font-bold truncate max-w-[200px] block">{profile.id}</span>
                </div>
                <button
                  onClick={handleCopyUserId}
                  className="p-1.5 bg-zinc-900 border border-zinc-700 hover:border-[#ffe600] rounded-lg text-zinc-300 hover:text-[#ffe600] transition-colors cursor-pointer"
                  title="Copy User ID"
                >
                  {copiedId ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isOwnProfile && (
              <div className="pt-4 border-t-2 border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border-2 border-rose-800/80 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-brutal-sm"
                >
                  <AlertCircle className="h-4 w-4 stroke-[2.5]" />
                  <span>Delete Account & Data</span>
                </button>

                <button
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                  }}
                  className="px-5 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-2 border-rose-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-brutal-sm"
                >
                  <LogOut className="h-4 w-4 stroke-[3]" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border-4 border-black rounded-3xl p-6 md:p-8 max-w-md w-full shadow-brutal space-y-5 relative">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmInput('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1 cursor-pointer"
            >
              <X className="h-5 w-5 stroke-[3]" />
            </button>

            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="h-8 w-8 stroke-[2.5]" />
              <h3 className="text-xl font-impact uppercase tracking-wide text-zinc-100">Permanent Account Deletion</h3>
            </div>

            <p className="text-xs text-zinc-300 font-medium leading-relaxed bg-rose-950/40 p-3.5 border-2 border-rose-900 rounded-2xl">
              ⚠️ Warning: This action cannot be undone. All your profile info, launched products, upvotes, comments, and earned points will be permanently deleted from MemeLaunch.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-300">
                To confirm, type <span className="text-rose-400 font-mono font-bold">DELETE MY ACCOUNT</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-4 py-2.5 bg-zinc-950 border-2 border-black rounded-xl text-xs focus:outline-none focus:border-rose-500 text-zinc-100 font-mono font-bold"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmInput !== 'DELETE MY ACCOUNT' || isDeletingAccount}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-brutal-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4 stroke-[3]" />}
                <span>Confirm & Delete</span>
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmInput('');
                }}
                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl border-2 border-black cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
