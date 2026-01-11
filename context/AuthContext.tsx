
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, signupUser, fetchCurrentUser, googleAuthenticate } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  socialLogin: (token: string, provider?: 'google') => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hv_token');
      if (token) {
        try {
          const userData = await fetchCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error("Session expired or invalid");
          localStorage.removeItem('hv_token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { token, user: userData } = await loginUser(data);
      localStorage.setItem('hv_token', token);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { token, user: userData } = await signupUser(data);
      localStorage.setItem('hv_token', token);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (token: string, provider: 'google' = 'google') => {
    setIsLoading(true);
    setError(null);
    try {
        const { token: appToken, user: userData } = await googleAuthenticate(token);
        localStorage.setItem('hv_token', appToken);
        setUser(userData);
    } catch (err: any) {
        setError(err.message || 'Social login failed');
        throw err;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hv_token');
    localStorage.removeItem('himalaya_admin_session'); // clear legacy admin token
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin: user?.role === 'ADMIN',
      isLoading, 
      login, 
      signup, 
      socialLogin,
      logout,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
