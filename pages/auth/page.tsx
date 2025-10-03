import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { useRouter } from 'next/router';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';

type AuthView = 'login' | 'signup';

const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if already authenticated
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card loading style={{ width: 400 }} />
      </div>
    );
  }

  // Don't render auth forms if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 500,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          borderRadius: 8
        }}
      >
        {view === 'login' ? (
          <LoginForm onSwitchToSignup={() => setView('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setView('login')} />
        )}
      </Card>
    </div>
  );
};

export default AuthPage;
