import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { userService } from '@/services/userService';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AuthContextType {
  currentUser: User | null;
  loginByName: (name: string, roleType: 'manager' | 'team_leader', password?: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberedUsers: { name: string; roleType: 'manager' | 'team_leader' }[];
  addRememberedUser: (name: string, roleType: 'manager' | 'team_leader') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Session storage for current login (clears when browser closes)
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('currentUserId');
    }
    return null;
  });

  // Local storage for remembered users (persists)
  const [rememberedUsers, setRememberedUsers] = useLocalStorage<{ name: string; roleType: 'manager' | 'team_leader' }[]>('rememberedUsers', []);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (sessionUserId) {
        try {
          const user = await userService.getById(sessionUserId);
          if (user) {
            setCurrentUser(user);
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, [sessionUserId]);

  const loginByName = async (name: string, roleType: 'manager' | 'team_leader', password?: string): Promise<User | null> => {
    try {
      // Use verified login
      const user = await userService.login(name, roleType, password);

      if (user) {
        setCurrentUser(user);
        setSessionUserId(user.id);
        sessionStorage.setItem('currentUserId', user.id);
        addRememberedUser(name, roleType);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSessionUserId(null);
    sessionStorage.removeItem('currentUserId');
  };

  const addRememberedUser = (name: string, roleType: 'manager' | 'team_leader') => {
    setRememberedUsers(prev => {
      // Remove if exists and add to front (most recent first)
      const filtered = prev.filter(u => !(u.name.toLowerCase() === name.toLowerCase() && u.roleType === roleType));
      return [{ name, roleType }, ...filtered].slice(0, 10); // Keep only 10 most recent
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loginByName,
      logout,
      isAuthenticated: !!currentUser,
      isLoading,
      rememberedUsers,
      addRememberedUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
