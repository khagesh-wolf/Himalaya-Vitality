import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, signupUser, fetchCurrentUser, googleAuthenticate, verifyEmail as verifyEmailApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<any>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
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
      // Backend throws 403 with requiresVerification if needed
      localStorage.setItem('hv_token', token);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      // Re-throw so page component can detect verification requirement
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signupUser(data);
      if (result.token && result.user) {
          localStorage.setItem('hv_token', result.token);
          setUser(result.user);
      }
      // Return result so component can handle 'requiresVerification' and 'debugOtp'
      return result;
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
      setIsLoading(true);
      setError(null);
      try {
          const { token, user: userData } = await verifyEmailApi(email, otp);
          localStorage.setItem('hv_token', token);
          setUser(userData);
      } catch (err: any) {
          setError(err.message || 'Verification failed');
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
    localStorage.removeItem('himalaya_admin_session'); 
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
      verifyEmail,
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