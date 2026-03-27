import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const TOKEN_KEY  = 'auth_token';
const USER_KEY   = 'auth_user';
const BASE_URL   = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid email or password');
      }

      // Backend returns: { token, email, name, role, photo }
      const data = await res.json();
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
  // token comes from /auth/callback?token=..., userInfo from GET /api/auth/me
  const loginWithToken = useCallback((token, userInfo) => {
    const userData = {
      name:  userInfo.name,
      email: userInfo.email,
      role:  userInfo.role,
      photo: userInfo.photo || null,
    };
    persist(token, userData);
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }

      // Auto-login after successful registration
      return await login(email, password);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ── Update profile (local + backend) ───────────────────────────────────────
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

      if (!res.ok) throw new Error('Failed to update profile');

      const updated = await res.json();
      const updatedUser = { ...user, ...updated };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      // Keep profileSettings in sync for pages that still read it
      localStorage.setItem('profileSettings', JSON.stringify(profileData));
      return { success: true };
    } catch (err) {
      // Fallback: update locally only (so UI doesn't break if endpoint isn't ready)
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      localStorage.setItem('profileSettings', JSON.stringify(profileData));
      return { success: true };
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
    loginWithToken,   // used by OAuthCallback
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