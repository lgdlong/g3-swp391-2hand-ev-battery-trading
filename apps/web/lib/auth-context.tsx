'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAccessToken } from './auth';
import { ACCESS_TOKEN_KEY } from '@/config/constants';
import { getCurrentAccount } from '@/lib/api/accountApi';
import type { Account } from '@/types/account';
import { AccountRole } from '@/types/enums/account-enum';

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  user: Account | null;
  login: (token: string, user: Partial<Account>) => void;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<Account | null>(null);
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
          // Fallback to logged out state on error
          logout();
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

  // Fetch complete user profile from /accounts/me
  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const fullUserData = await getCurrentAccount();

      localStorage.setItem('user_data', JSON.stringify(fullUserData));
      setUser(fullUserData);
      setUserRole(fullUserData.role || 'user');
    } catch (error) {
      console.error('[AuthContext] Error fetching user profile:', error);
    }
  }, []);

  const login = useCallback(async (token: string, userData: Partial<Account>) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUserRole(userData.role || AccountRole.USER);
    setUser(userData as Account);

    // Fetch complete user profile including avatarUrl
    try {
      const fullUserData = await getCurrentAccount();
      localStorage.setItem('user_data', JSON.stringify(fullUserData));
      setUser(fullUserData);
      setUserRole(fullUserData.role || 'user');
    } catch (error) {
      console.error('[AuthContext] Error fetching complete user profile:', error);
    }
  }, []);

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
        refreshUser,
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
