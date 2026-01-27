import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/data/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AuthContextType {
  currentUser: User | null;
  login: (pin: string) => User | null;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedUserId, setSavedUserId] = useLocalStorage<string | null>('currentUserId', null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (savedUserId) {
      const user = mockUsers.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [savedUserId]);

  const login = (pin: string): User | null => {
    const user = mockUsers.find(u => u.pin === pin);
    if (user) {
      setCurrentUser(user);
      setSavedUserId(user.id);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setSavedUserId(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAuthenticated: !!currentUser,
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
