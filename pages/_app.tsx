import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import 'antd/dist/reset.css';
import { configureAmplify } from '@/lib/amplify-config';
import { AuthProvider } from '@/contexts/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Configure Amplify on app initialization
    configureAmplify();
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
