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
}

interface AuthContextType {
  user: { uid: string; email: string; displayName?: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const USERS_KEY = 'arathel_users';
const CURRENT_USER_KEY = 'arathel_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email: string; displayName?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      let userProfile = allUsers.find((u: any) => u.uid === parsedUser.uid);
      
      // Force admin role for specific email
      if (userProfile && userProfile.email === 'pastorjohn046@gmail.com' && userProfile.role !== 'admin') {
        userProfile.role = 'admin';
        const updatedUsers = allUsers.map((u: any) => u.uid === userProfile.uid ? userProfile : u);
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      }

      if (userProfile) {
        setProfile(userProfile);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = allUsers.find((u: any) => u.email === email && u.password === pass);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const { password, ...userProfile } = foundUser;
    const sessionUser = { uid: userProfile.uid, email: userProfile.email, displayName: userProfile.displayName };
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setProfile(userProfile);
  };

  const register = async (email: string, pass: string, name: string) => {
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (allUsers.some((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const uid = Math.random().toString(36).substring(2, 15);
    const numericId = Math.floor(Math.random() * 9000000 + 1000000).toString();
    
    const newProfile: UserProfile & { password?: string } = {
      uid,
      numericId,
      email,
      displayName: name,
      password: pass,
      role: email === 'pastorjohn046@gmail.com' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      portfolioValue: 0,
      buyingPower: 100000,
      holdings: [],
      watchlist: ['AAPL', 'MSFT', 'NVDA'],
    };

    allUsers.push(newProfile);
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    
    const { password, ...sessionProfile } = newProfile;
    const sessionUser = { uid, email, displayName: name };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setProfile(sessionProfile as UserProfile);
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = allUsers.map((u: any) => {
      if (u.uid === user.uid) {
        return { ...u, ...updates };
      }
      return u;
    });
    
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    const updatedProfile = updatedUsers.find((u: any) => u.uid === user.uid);
    if (updatedProfile) {
      const { password, ...prof } = updatedProfile;
      setProfile(prof as UserProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: profile?.role === 'admin',
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
