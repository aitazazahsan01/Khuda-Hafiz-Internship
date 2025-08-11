import { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile } from '@/types'; 

type CustomUser = UserProfile

interface AuthContextType {
  user: CustomUser | null;
  profile: CustomUser | null; // ADDED: for compatibility with existing components
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const loggedInUser: CustomUser = data.user;
      // CHANGED: Also get and store the JWT token from the response
      const token: string = data.token;

      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('token', token); // Store the token
      
      setUser(loggedInUser);

    } catch (error) {
      console.error(error);
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // CHANGED: Also remove the token on logout
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'administrator';
  };

  // CHANGED: Added 'profile: user' so components expecting 'profile' don't break
  const value = { user, profile: user, loading, login, logout, isAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};