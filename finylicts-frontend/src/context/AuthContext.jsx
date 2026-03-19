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

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError('');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // This would be replaced with actual API call
      if (email === 'john@finlytics.com' && password === 'Finlytics2026!') {
        const userData = {
          id: 1,
          name: 'Capt HM',
          email: 'john@finlytics.com',
          phone: '+254712345678',
          location: 'Nairobi, Kenya',
          bio: 'Financial enthusiast passionate about budgeting and saving for the future.',
          joinDate: 'January 2026',
          avatar: null,
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

  const register = async (name, email, password, phone, location) => {
    setError('');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (name && email && password && phone) {
        const userData = {
          id: Date.now(),
          name: name.trim(),
          email,
          phone,
          location: location || '',
          bio: '',
          joinDate: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          avatar: null,
          createdAt: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Also save to profile settings for consistency
        localStorage.setItem('profileSettings', JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          location: userData.location,
          bio: userData.bio,
          joinDate: userData.joinDate,
          avatar: userData.avatar
        }));
        
        return { success: true };
      } else {
        throw new Error('Please fill in all required fields');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (profileData) => {
    setError('');
    
    try {
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        avatar: profileData.avatar,
        joinDate: profileData.joinDate
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('profileSettings', JSON.stringify(profileData));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const forgotPassword = async (email) => {
    setError('');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (email) {
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
    forgotPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};