'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';

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
        const isNoToken = error.message?.toLowerCase().includes('refresh token');
        if (!isNoToken) {
          console.error('Error fetching current user:', error);
        }
        // Clear invalid tokens from SDK
        await insforge.auth.signOut().catch(() => {});
        setUser(null);
      } else {
        setUser(data?.user as AuthUser | null);
      }
    } catch (err: any) {
      const isNoToken = err?.message?.toLowerCase().includes('refresh token');
      if (!isNoToken) {
        console.error('Auth check failed:', err);
      }
      // Clear invalid tokens from SDK
      await insforge.auth.signOut().catch(() => {});
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
