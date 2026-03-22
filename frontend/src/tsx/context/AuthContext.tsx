import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

interface AuthContextValue {
  currentUser: User | null;
  startupId: number | null;
  setStartupId: (id: number) => void;
  login: (user: User, token: string, startupId?: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hydrateUser(): User | null {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hydrateStartupId(): number | null {
  const raw = localStorage.getItem('startupId');
  return raw ? parseInt(raw) : null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(hydrateUser);
  const [startupId, setStartupId] = useState<number | null>(hydrateStartupId);

  const login = (user: User, token: string, sid?: number) => {
    localStorage.setItem('jwt', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (sid != null) {
      localStorage.setItem('startupId', String(sid));
      setStartupId(sid);
    }
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('startupId');
    localStorage.removeItem('userId');
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_startup');
    localStorage.removeItem('demo_members');
    localStorage.removeItem('demo_heatmap');
    localStorage.removeItem('demo_analysis');
    localStorage.removeItem('demo_techstack');
    setCurrentUser(null);
    setStartupId(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, startupId, setStartupId: (id: number) => { localStorage.setItem('startupId', String(id)); setStartupId(id); }, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
