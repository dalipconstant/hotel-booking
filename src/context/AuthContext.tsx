import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, UserRole } from '../types';
import { DEMO_ADMIN, DEMO_WORKER } from '../lib/mockData';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isWorker: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode credentials
const DEMO_CREDENTIALS: Record<string, { password: string; profile: Profile }> = {
  'sgtraders542@gmail.com': { password: 'admin123', profile: DEMO_ADMIN },
  'worker@hotel.com': { password: 'worker123', profile: DEMO_WORKER },
  'guest@demo.com': {
    password: 'guest123',
    profile: {
      id: 'guest-demo',
      email: 'guest@demo.com',
      full_name: 'Demo Guest',
      role: 'guest',
      created_at: new Date().toISOString(),
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage for demo mode
    const saved = localStorage.getItem('hotel_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('hotel_user');
      }
    }

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setUser(data as Profile);
      localStorage.setItem('hotel_user', JSON.stringify(data));
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    // Demo mode first
    const demo = DEMO_CREDENTIALS[email.toLowerCase()];
    if (demo && demo.password === password) {
      setUser(demo.profile);
      localStorage.setItem('hotel_user', JSON.stringify(demo.profile));
      return {};
    }

    if (!isSupabaseConfigured) {
      return { error: 'Invalid credentials. Try demo accounts: sgtraders542@gmail.com / admin123, worker@hotel.com / worker123, guest@demo.com / guest123' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) await fetchProfile(data.user.id);
    return {};
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      // Demo signup creates a local guest
      const newUser: Profile = {
        id: `guest-${Date.now()}`,
        email,
        full_name: fullName,
        role: 'guest',
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('hotel_user', JSON.stringify(newUser));
      return {};
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'guest' as UserRole } },
    });
    if (error) return { error: error.message };

    if (data.user) {
      // Profile is usually created via trigger
      await fetchProfile(data.user.id);
    }
    return {};
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('hotel_user');
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === 'admin',
    isWorker: user?.role === 'worker',
    isGuest: user?.role === 'guest' || (!user?.role && !!user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
