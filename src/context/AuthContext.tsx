import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Profile } from '../types/domain';
import { usuariosService, DEFAULT_PROFILES } from '../services/usuarios.service';
import { UserRole } from '../config/appConfig';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  loginAsDemoUser: (role: UserRole, email?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'gruas_demo_auth_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session in local storage first
    const saved = localStorage.getItem(LOCAL_SESSION_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEFAULT_PROFILES[1]); // Default to Oficina
      }
    } else {
      // Default initial demo user: Oficina
      setUser(DEFAULT_PROFILES[1]);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(DEFAULT_PROFILES[1]));
    }
    setLoading(false);
  }, []);

  const loginAsDemoUser = async (role: UserRole, email?: string) => {
    setLoading(true);
    let target: Profile | undefined;
    if (email) {
      target = DEFAULT_PROFILES.find(p => p.email === email);
    }
    if (!target) {
      target = DEFAULT_PROFILES.find(p => p.rol === role);
    }
    if (target) {
      setUser(target);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(target));
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAsDemoUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
