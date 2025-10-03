import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, fetchAuthSession, signOut as amplifySignOut, AuthUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/router';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();

    // Listen to auth events
    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          router.push('/');
          break;
        case 'signedOut':
          setUser(null);
          router.push('/auth/page');
          break;
        case 'tokenRefresh':
          checkUser();
          break;
        case 'tokenRefresh_failure':
          setUser(null);
          router.push('/auth/page');
          break;
      }
    });

    return () => hubListener();
  }, []);

  const signOut = async () => {
    try {
      await amplifySignOut();
      setUser(null);
      router.push('/auth/page');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      return token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    getAccessToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
