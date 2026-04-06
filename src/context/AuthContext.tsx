import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'student';
  class?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify user still exists in database (handles DB resets)
          const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', parsedUser.id)
            .single();
            
          if (error || !data) {
            console.warn('User not found in database, clearing session');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            setUser(parsedUser);
          }
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    verifyUser();
  }, []);

  const login = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
