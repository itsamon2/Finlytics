import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const REAL_ACCOUNT = {
    email: 'munch@finlytics.com',
    password: 'Finlytics2026!',
    name: 'Jai Munchkin',
    id: 1
  };

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    setError('');
    
    // Simulate API delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check against the single real account
      if (email === REAL_ACCOUNT.email && password === REAL_ACCOUNT.password) {
        const userData = {
          id: REAL_ACCOUNT.id,
          email: REAL_ACCOUNT.email,
          name: REAL_ACCOUNT.name,
          createdAt: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setError('');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // will be saved to a database
      // For now, we'll create a new user account
      if (name && email && password) {
        const userData = {
          id: Date.now(),
          name,
          email,
          createdAt: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        throw new Error('Please fill in all fields');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setError('');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (email) {
        // will send a reset email
        return { success: true };
      } else {
        throw new Error('Please enter your email');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};