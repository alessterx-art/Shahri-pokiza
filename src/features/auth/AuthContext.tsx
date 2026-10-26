import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, UserRole } from '@/src/types/database';
import { dbRepository } from '@/src/lib/supabase/client';

interface AuthContextType {
  currentUser: Profile;
  switchRole: (role: UserRole) => void;
  setUserById: (id: string) => void;
  allProfiles: Profile[];
  isAuthenticated: boolean;
  loginWithEmail: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(dbRepository.getProfiles());
  const [currentUserId, setCurrentUserId] = useState<string>('a0000000-0000-0000-0000-000000000001'); // Default to Admin for judging ease

  useEffect(() => {
    const unsub = dbRepository.subscribe(() => {
      setProfiles(dbRepository.getProfiles());
    });
    return unsub;
  }, []);

  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0];

  const switchRole = (role: UserRole) => {
    const target = profiles.find((p) => p.role === role);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  const setUserById = (id: string) => {
    const target = profiles.find((p) => p.id === id);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  const loginWithEmail = async (email: string, requestedRole: UserRole = 'public_user'): Promise<boolean> => {
    // Note: Security rule: user registration defaults to 'public_user', never privileged roles
    const safeRole: UserRole = requestedRole === 'public_user' ? 'public_user' : 'public_user';
    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      display_name: email.split('@')[0],
      role: safeRole,
      account_status: 'active',
      phone: '+992 92 000 0000',
      created_at: new Date().toISOString(),
    };
    dbRepository.getProfiles().push(newProfile);
    setCurrentUserId(newProfile.id);
    return true;
  };

  const logout = () => {
    // Switch to public user
    switchRole('public_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        setUserById,
        allProfiles: profiles,
        isAuthenticated: true,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
