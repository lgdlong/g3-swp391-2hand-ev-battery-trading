'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAccessToken } from './auth';
import { ACCESS_TOKEN_KEY } from '@/config/constants';

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getAccessToken();
    if (token) {
      // Try to get user data from localStorage
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsLoggedIn(true);
          setUserRole(parsedUser.role || 'user');
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Fallback to basic login state
          setIsLoggedIn(true);
          setUserRole('user');
          setUser({ role: 'user' });
        }
      } else {
        // No user data found, set logged out state
        setIsLoggedIn(false);
        setUserRole(null);
        setUser(null);
      }
    } else {
      // No token, ensure logged out state
      setIsLoggedIn(false);
      setUserRole(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUserRole(userData.role || 'user');
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('user_data');
    setIsLoggedIn(false);
    setUserRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userRole,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
