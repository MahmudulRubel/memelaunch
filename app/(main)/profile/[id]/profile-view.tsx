'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';
import { insforge, resolveStorageUrl } from '@/lib/insforge';
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
  Camera
} from 'lucide-react';

interface ProfileData {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

interface ProfileViewProps {
  profileId: string;
  initialProfile: ProfileData | null;
  initialLaunches: Launch[];
}

export default function ProfileView({ profileId, initialProfile, initialLaunches }: ProfileViewProps) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  // Profile data
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [launches, setLaunches] = useState<Launch[]>(initialLaunches || []);
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialProfile?.name || '');
  const [editBio, setEditBio] = useState(initialProfile?.bio || '');
  const [editAvatar, setEditAvatar] = useState(initialProfile?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas card generation state
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // General refetch function
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

      setProfile(profileData as ProfileData);
      setEditName(profileData.name || '');
      setEditBio(profileData.bio || '');
      setEditAvatar(profileData.avatar || '');

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

  // Statistics calculation
  const stats = useMemo(() => {
    const totalLaunches = launches.length;
    let totalReactions = 0;

    launches.forEach((launch) => {
      totalReactions += launch.reactions?.length || 0;
    });

    return {
      totalLaunches,
      totalReactions,
    };
  }, [launches]);

  // Achievements evaluation
  const achievements = useMemo(() => {
    return [
      {
        id: 'meme-pioneer',
        title: 'Meme Pioneer',
        description: 'Successfully launched your first meme-native product.',
        icon: Sparkles,
        color: 'text-lime-400 border-lime-400/30 bg-lime-950/10 shadow-[0_0_15px_rgba(163,230,53,0.1)]',
        unlocked: stats.totalLaunches >= 1,
        requirement: '1 Launch required',
      },
      {
        id: 'arena-veteran',
        title: 'Arena Veteran',
        description: 'Consistent builder with 3 or more product launches.',
        icon: Trophy,
        color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]',
        unlocked: stats.totalLaunches >= 3,
        requirement: '3 Launches required',
      },
      {
        id: 'reaction-magnet',
        title: 'Reaction Magnet',
        description: 'Fired up the arena and gathered 10+ community reactions.',
        icon: Flame,
        color: 'text-rose-400 border-rose-400/30 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
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

  // Save profile updates
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
        
        const { data: uploadData, error: uploadError } = await insforge.storage
          .from('avatars')
          .upload(avatarPath, avatarFile);

        if (uploadError || !uploadData) {
          throw new Error(uploadError?.message || 'Avatar upload failed.');
        }

        finalAvatarUrl = uploadData.url;
      }

      // 2. Update users table row
      const { error: updateError } = await insforge.database
        .from('users')
        .update({
          name: editName.trim(),
          bio: editBio.trim(),
          avatar: finalAvatarUrl,
        })
        .eq('id', profileId);

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
            }
          : null
      );
      
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
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
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.2)';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, 784, 434);

      // Draw subtle green neon grid glow
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 40; i < 800; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 450);
        ctx.stroke();
      }
      for (let i = 40; i < 450; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(800, i);
        ctx.stroke();
      }

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
              
              ctx.strokeStyle = '#a3e635';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(100, 110, 50, 0, Math.PI * 2);
              ctx.stroke();
            } catch (e) {
              console.error('CORS blocked avatar drawing, fallback used');
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

        ctx.strokeStyle = '#a3e635';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(100, 110, 50, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fafafa';
        ctx.font = 'bold 42px Outfit, sans-serif';
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
      ctx.font = 'bold 32px Outfit, sans-serif';
      ctx.fillText(profile.name || 'Founder', 170, 75);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '16px Inter, sans-serif';
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

      // 4. Stats
      const drawStat = (label: string, value: number, x: number) => {
        ctx.fillStyle = 'rgba(24, 24, 27, 0.6)';
        ctx.fillRect(x, 220, 180, 100);
        ctx.strokeStyle = 'rgba(39, 39, 42, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, 220, 180, 100);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#a3e635';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(value.toString(), x + 90, 235);
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.fillText(label.toUpperCase(), x + 90, 285);
      };

      drawStat('Launches', stats.totalLaunches, 180);
      drawStat('Vibe Reactions', stats.totalReactions, 440);

      // 5. Watermarks
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(163, 230, 53, 0.4)';
      ctx.font = 'bold 20px Impact, sans-serif';
      ctx.fillText('MEMELAUNCH', 50, 380);

      ctx.fillStyle = 'rgba(161, 161, 170, 0.4)';
      ctx.font = '12px monospace';
      ctx.fillText('FUN HOOKS. SERIOUS DETAILS.', 170, 385);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#a3e635';
      ctx.font = 'bold 12px Outfit, sans-serif';
      
      const unlockedCount = achievements.filter((a) => a.unlocked).length;
      let rankName = 'Meme Recruit';
      if (unlockedCount === 3) rankName = 'Meme Deity';
      else if (unlockedCount === 2) rankName = 'Arena Master';
      else if (unlockedCount === 1) rankName = 'Meme Pioneer';

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

    const text = `Check out my Founder Stats on @MemeLaunch! 🚀\n\n🎯 launches: ${stats.totalLaunches}\n🔥 reactions: ${stats.totalReactions}\n🏅 Rank: ${rankName}\n\nJoin the chaos of meme-native product discovery! 👾👇\n`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://memelaunch.app/profile/${profileId}`;
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  }, [profile, stats, achievements, profileId]);

  const formattedJoinedDate = useMemo(() => {
    if (!profile?.created_at) return '';
    return new Date(profile.created_at).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }, [profile?.created_at]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 text-lime-400 animate-spin" />
        <p className="text-zinc-400 font-mono text-sm">Decoding founder achievements telemetry...</p>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/20 border border-zinc-850 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h3 className="text-lg font-bold text-zinc-200">Founder Profile Unavailable</h3>
        <p className="text-zinc-400 text-sm">{errorMsg || 'This developer is hiding in the shadows.'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-sm font-bold text-zinc-200"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <canvas ref={canvasRef} className="hidden" />

      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/80 bg-zinc-900/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-zinc-900 border-2 border-lime-400/30 group-hover:border-lime-400 transition-all flex items-center justify-center font-impact text-3xl uppercase text-lime-400 overflow-hidden shadow-2xl">
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
                  profile.name ? profile.name[0] : '?'
                )}
              </div>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded-full transition-all border border-zinc-950 shadow-md cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
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

            <div className="space-y-2">
              {isEditing ? (
                <div className="space-y-3 max-w-sm">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Display Name"
                    className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-lime-500 text-zinc-100 font-bold"
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Write a funny bio..."
                    rows={2}
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-lime-500 text-zinc-350"
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="font-impact text-2xl md:text-3xl uppercase tracking-tight text-zinc-50 group-hover:text-lime-400 transition-colors">
                      {profile.name || 'Founder'}
                    </h1>
                    
                    {isOwnProfile && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-805 border border-zinc-700/60 text-[9px] font-mono text-zinc-400 tracking-wider uppercase font-bold">
                        YOU
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-400 text-sm max-w-md italic font-sans leading-relaxed">
                    {profile.bio || 'This founder hasn\'t typed their bio yet. Probably too busy polishing memes.'}
                  </p>
                </>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500 font-mono">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {formattedJoinedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isOwnProfile ? (
              isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(163,230,53,0.15)] flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setAvatarPreview(null);
                      setAvatarFile(null);
                      setEditName(profile.name || '');
                      setEditBio(profile.bio || '');
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800/85 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-lime-400" />
                  <span>Edit Profile</span>
                </button>
              )
            ) : null}

            <a
              href={shareToXUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-cyan-455" />
              <span>Share to X</span>
            </a>

            <button
              onClick={handleDownloadShareCard}
              disabled={isGeneratingCard}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingCard ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 text-lime-400" />
              )}
              <span>Stats Card</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-16 h-16 bg-lime-400/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Total Launches
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-zinc-100 font-mono">
              {stats.totalLaunches}
            </span>
            <span className="text-xs text-zinc-550 font-mono">memes</span>
          </div>
        </div>

        <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Vibe Reactions Received
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-rose-400 font-mono">
              {stats.totalReactions}
            </span>
            <span className="text-xs text-zinc-550 font-mono">votes</span>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Trophy className="h-5 w-5 text-lime-400" />
          <h2 className="text-lg font-bold text-zinc-200">Founder Achievements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-4 border rounded-2xl flex flex-col justify-between h-44 relative transition-all duration-300 ${
                  badge.unlocked
                    ? `${badge.color} border-zinc-850 hover:border-lime-500/25`
                    : 'bg-zinc-950/40 border-zinc-900/80 opacity-40 select-none'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border ${badge.unlocked ? 'border-lime-400/20 bg-lime-400/10' : 'border-zinc-800 bg-zinc-900'}`}>
                      <Icon className={`h-5 w-5 ${badge.unlocked ? 'text-lime-400 animate-pulse' : 'text-zinc-650'}`} />
                    </div>

                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                      {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>

                  <h3 className={`font-extrabold text-sm ${badge.unlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                    {badge.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {badge.description}
                  </p>
                </div>

                <div className="text-[10px] font-mono text-zinc-500/90 pt-2 border-t border-zinc-900/60 mt-2">
                  {badge.requirement}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Launches Feed */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-lime-400" />
            <h2 className="text-lg font-bold text-zinc-200">Launches Archive ({launches.length})</h2>
          </div>
          
          {isOwnProfile && (
            <button
              onClick={() => router.push('/launch')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-[10px] tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Launch Meme</span>
            </button>
          )}
        </div>

        {launches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/10 border border-zinc-850 rounded-3xl text-center space-y-4 max-w-md mx-auto">
            <p className="text-zinc-500 font-mono text-sm">This founder has launched exactly 0 memes. The silent builder type.</p>
            {isOwnProfile && (
              <button
                onClick={() => router.push('/launch')}
                className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(163,230,53,0.1)] cursor-pointer"
              >
                Deploy Your First Shitpost
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {launches.map((launch) => (
              <MemeCard
                key={launch.id}
                launch={launch}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
