'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { RewardToast } from '@/components/points/reward-toast';

interface UserProfile {
  name: string | null;
  avatar_url: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile | null;
  metadata: Record<string, any>;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error) {
        const isNoToken = 
          error.message?.toLowerCase().includes('refresh token') ||
          error.message?.toLowerCase().includes('csrf') ||
          error.message?.toLowerCase().includes('jwt') ||
          error.message?.toLowerCase().includes('unauthorized');

        const isNetworkOrTimeout = 
          error.statusCode === 0 || 
          error.statusCode === 408 || 
          error.error === 'REQUEST_TIMEOUT' || 
          error.error === 'NETWORK_ERROR' ||
          error.message?.toLowerCase().includes('timeout') ||
          error.message?.toLowerCase().includes('network');

        if (!isNoToken && !isNetworkOrTimeout) {
          console.error('Error fetching current user:', error);
          insforge.auth.signOut().catch(() => {});
        } else if (isNoToken) {
          // Silently clean up stale or invalid CSRF / session tokens
          insforge.auth.signOut().catch(() => {});
        } else if (isNetworkOrTimeout) {
          console.warn('Network or timeout error during auth check. Retaining local session state.');
        }
        setUser(null);
      } else {
        setUser(data?.user as AuthUser | null);
      }
    } catch (err: any) {
      const isNoToken = 
        err?.message?.toLowerCase().includes('refresh token') ||
        err?.message?.toLowerCase().includes('csrf') ||
        err?.message?.toLowerCase().includes('jwt') ||
        err?.message?.toLowerCase().includes('unauthorized');

      const isNetworkOrTimeout = 
        err?.statusCode === 0 || 
        err?.statusCode === 408 || 
        err?.error === 'REQUEST_TIMEOUT' || 
        err?.error === 'NETWORK_ERROR' ||
        err?.message?.toLowerCase().includes('timeout') ||
        err?.message?.toLowerCase().includes('network');

      if (!isNoToken && !isNetworkOrTimeout) {
        console.error('Auth check failed:', err);
        insforge.auth.signOut().catch(() => {});
      } else if (isNoToken) {
        insforge.auth.signOut().catch(() => {});
      } else if (isNetworkOrTimeout) {
        console.warn('Network or timeout error caught during auth check:', err.message);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await insforge.auth.signOut();
      if (!error) {
        setUser(null);
      }
      return { error };
    } catch (err) {
      return { error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signOut: handleSignOut,
        refreshUser: fetchUser,
      }}
    >
      {children}
      <RewardToast />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
