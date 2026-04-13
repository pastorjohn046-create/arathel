import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  uid: string;
  numericId: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin';
  createdAt: string;
  portfolioValue: number;
  buyingPower: number;
  holdings: any[];
  watchlist: string[];
  paymentMethods?: any[];
}

interface User {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchProfile(parsedUser.uid);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const response = await fetch(`/api/users`);
      const users = await response.json();
      const userProfile = users.find((u: any) => u.uid === uid);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await response.json();
      if (data.user) {
        const userData = { uid: data.user.uid, email: data.user.email };
        setUser(userData);
        setProfile(data.user);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    // For simplicity, register is same as login in this mock setup
    await login(email, pass);
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('auth_user');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: profile?.role === 'admin' || profile?.email === 'pastorjohn046@gmail.com',
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

