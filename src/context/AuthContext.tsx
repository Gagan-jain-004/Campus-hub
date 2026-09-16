'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

export interface UserSession {
  id: string;
  clerkId?: string | null;
  name: string;
  email: string;
  username: string;
  avatar?: string | null;
  course?: string | null;
  branch?: string | null;
  gradYear?: number | null;
  role: 'STUDENT' | 'ADMIN';
  isVerified: boolean;
  collegeId?: string | null;
  collegeName?: string | null;
  collegeShortName?: string | null;
}

interface ActiveCollege {
  id: string;
  name: string;
  shortName: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  activeCollege: ActiveCollege | null;
  activeCollegeId: string | null;
  activeCollegeName: string;
  activeCollegeShortName: string;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (userData: UserSession) => void;
  logout: () => Promise<void>;
  switchCollege: (college: ActiveCollege) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState<UserSession | null>(null);
  const [activeCollege, setActiveCollege] = useState<ActiveCollege>({
    id: 'rtu_kota_main',
    name: 'Rajasthan Technical University (RTU Kota)',
    shortName: 'RTU Kota',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 1. Initial college and user sync
  useEffect(() => {
    // Fetch RTU Kota details from backend
    fetch('/api/colleges')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.[0]) {
          const rtu = data.data[0];
          const collegeObj = {
            id: rtu.id,
            name: rtu.name,
            shortName: rtu.shortName,
          };
          setActiveCollege(collegeObj);
          localStorage.setItem('campushub_active_college', JSON.stringify(collegeObj));
        }
      })
      .catch(console.error);

    try {
      const savedUser = localStorage.getItem('campushub_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // 2. Automatically sync with Clerk when signed in
  useEffect(() => {
    if (isClerkLoaded && isSignedIn && clerkUser) {
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
      if (!primaryEmail) return;

      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email: primaryEmail,
          name: clerkUser.fullName || primaryEmail.split('@')[0],
          avatar: clerkUser.imageUrl,
          collegeId: activeCollege?.id || undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const syncedUser: UserSession = {
              id: data.data.id,
              clerkId: clerkUser.id,
              name: data.data.name,
              email: data.data.email,
              username: data.data.username,
              avatar: data.data.avatar,
              role: data.data.role,
              isVerified: data.data.isVerified,
              collegeId: data.data.collegeId,
              collegeName: data.data.collegeName,
              collegeShortName: data.data.collegeShortName,
            };
            setUser(syncedUser);
            localStorage.setItem('campushub_user', JSON.stringify(syncedUser));

            if (data.data.collegeId && data.data.collegeName && data.data.collegeShortName) {
              const collegeObj = {
                id: data.data.collegeId,
                name: data.data.collegeName,
                shortName: data.data.collegeShortName,
              };
              setActiveCollege(collegeObj);
              localStorage.setItem('campushub_active_college', JSON.stringify(collegeObj));
            }
          }
        })
        .catch((err) => console.error('Failed to sync Clerk user with DB:', err));
    } else if (isClerkLoaded && !isSignedIn && user?.clerkId) {
      // Clerk session ended
      setUser(null);
      localStorage.removeItem('campushub_user');
    }
  }, [isClerkLoaded, isSignedIn, clerkUser]);

  const login = (userData: UserSession) => {
    setUser(userData);
    try {
      localStorage.setItem('campushub_user', JSON.stringify(userData));
    } catch {}

    if (userData.collegeId && userData.collegeName && userData.collegeShortName) {
      const collegeObj = {
        id: userData.collegeId,
        name: userData.collegeName,
        shortName: userData.collegeShortName,
      };
      setActiveCollege(collegeObj);
      try {
        localStorage.setItem('campushub_active_college', JSON.stringify(collegeObj));
      } catch {}
    }
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem('campushub_user');
      await signOut();
    } catch {}
  };

  const switchCollege = (college: ActiveCollege) => {
    setActiveCollege(college);
    try {
      localStorage.setItem('campushub_active_college', JSON.stringify(college));
    } catch {}

    if (user) {
      const updated = {
        ...user,
        collegeId: college.id,
        collegeName: college.name,
        collegeShortName: college.shortName,
      };
      setUser(updated);
      try {
        localStorage.setItem('campushub_user', JSON.stringify(updated));
      } catch {}
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user || (isClerkLoaded && !!isSignedIn),
        activeCollege,
        activeCollegeId: activeCollege?.id || null,
        activeCollegeName: activeCollege?.name || '',
        activeCollegeShortName: activeCollege?.shortName || '',
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        switchCollege,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
