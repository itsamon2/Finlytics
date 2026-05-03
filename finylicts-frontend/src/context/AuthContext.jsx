import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';
const BASE_URL  = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const token  = localStorage.getItem(TOKEN_KEY);
    const stored = localStorage.getItem(USER_KEY);
    if (token && stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // ── Shared: persist auth data ───────────────────────────────────────────────
  const persist = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  // ── Regular email/password login ────────────────────────────────────────────
  const login = async (email, password) => {
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 403) {
        return {
          success:    false,
          unverified: true,
          email:      data.email || email,
          error:      data.message || 'Email not verified',
        };
      }

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      const userData = {
        name:  data.name,
        email: data.email,
        role:  data.role,
        photo: data.photo || null,
      };

      persist(data.token, userData);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ── Called by OAuthCallback after Google redirect ───────────────────────────
  const loginWithToken = useCallback((token, userInfo) => {
    const userData = {
      name:  userInfo.name,
      email: userInfo.email,
      role:  userInfo.role,
      photo: userInfo.photo || null,
    };
    persist(token, userData);
  }, [persist]);

  // ── Called by VerifyOtpPage after successful OTP verification ───────────────
  const loginAfterOtp = useCallback((data) => {
    const userData = {
      name:  data.name,
      email: data.email,
      role:  data.role,
      photo: data.photo || null,
    };
    persist(data.token, userData);
  }, [persist]);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (name, email, password, phone, location) => {
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password, phone, location }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true, email };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ── Update profile ──────────────────────────────────────────────────────────
  const updateProfile = async (profileData) => {
    setError('');
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${BASE_URL}/api/user/profile`, {
        method:  'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to update profile');
      }

      // Normalize backend field names (firstName, lastName, phoneNumber, profilePhoto)
      // to frontend field names (name, phone, photo)
      const updatedUser = {
        ...user,
        name:   data.firstName && data.lastName
                  ? `${data.firstName} ${data.lastName}`.trim()
                  : data.name || user.name,
        email:  data.email        || user.email,
        phone:  data.phoneNumber  || user.phone,
        photo:  data.profilePhoto || profileData.avatar || user.photo,
        userId: data.userId       || user.userId,
      };

      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      localStorage.setItem('profileSettings', JSON.stringify(profileData));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ── Forgot password ─────────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    setError('');
    try {
      if (!email) throw new Error('Please enter your email');

      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send reset email');
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const isAuthenticated = !!user && !!localStorage.getItem(TOKEN_KEY);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    loginWithToken,
    loginAfterOtp,
    register,
    logout,
    forgotPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};