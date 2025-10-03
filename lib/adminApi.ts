import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

export interface UserStats {
  user_id: string;
  full_name: string;
  email: string;
  patient_count: number;
  successful_recordings: number;
  failed_recordings: number;
  total_hours: number;
  avg_length_seconds: number;
  avg_file_size_bytes: number;
  tier_name?: string;
}

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8000',
});

// Add request interceptor to include auth token
adminApi.interceptors.request.use(
  async (config) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getTenantStats = async (): Promise<UserStats[]> => {
  try {
    const response = await adminApi.get<UserStats[]>('/admin/users/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant stats:', error);
    return [];
  }
};

export const upgradeUserTier = async (userId: string, tierName: string): Promise<any> => {
  const response = await adminApi.post(`/admin/users/${userId}/upgrade`, { tier_name: tierName });
  return response.data;
};


// FOLDERS TO BE ADDED
// contexts (new folder)/AuthContext.tsx
// components/auth/LoginForm.tsx
// components/auth/SignupForm.tsx
// lib/amplify-config.ts
// pages/auth/page.tsx
