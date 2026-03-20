import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCamera, FiSave, FiEdit2, FiBell, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import './Settings.styles.css';

const SettingsPage = () => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState('');
  
  // Profile settings - initialized from user context
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    joinDate: '',
    avatar: null
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      pushNotifications: false,
      monthlyReports: true,
      budgetAlerts: true,
      goalReminders: true,
      marketingEmails: false
    };
  });

  // Security settings
  const [security, setSecurity] = useState(() => {
    const saved = localStorage.getItem('securitySettings');
    return saved ? JSON.parse(saved) : {
      twoFactorAuth: false,
      sessionTimeout: '30',
      loginAlerts: true
    };
  });

  // Appearance settings
  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem('appearanceSettings');
    return saved ? JSON.parse(saved) : {
      compactView: false,
      showAvatars: true
    };
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const colorOptions = [
    { name: 'Teal', value: '#2DD4BF' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' }
  ];

  // Load user data from auth context (this gets data from registration)
  useEffect(() => {
    if (user) {
      const userProfile = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        joinDate: user.joinDate || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        avatar: user.avatar || null
      };
      setProfileData(userProfile);
      setOriginalProfile(userProfile);
    } else {
      // Fallback if no user (shouldn't happen on protected page)
      const mockProfile = {
        name: 'Your name',
        email: 'name@example.com',
        phone: '+254 712 345 678',
        location: 'Nakuru, Kenya',
        bio: 'Financial enthusiast passionate about budgeting and saving for the future.',
        joinDate: 'January 2026',
        avatar: null
      };
      setProfileData(mockProfile);
      setOriginalProfile(mockProfile);
    }
  }, [user]);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (appearance.compactView) {
      document.body.classList.add('compact-view');
    } else {
      document.body.classList.remove('compact-view');
    }
  }, [appearance.compactView]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  // Profile handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setSaveStatus('');
    
    // Update profile through auth context (syncs with user data)
    const result = await updateProfile(profileData);
    
    if (result.success) {
      setOriginalProfile(profileData);
      setIsEditing(false);
      setSaveStatus('✓ Profile updated successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('✗ Failed to update profile');
      setTimeout(() => setSaveStatus(''), 3000);
    }
    
    setIsLoading(false);
  };

  const handleCancelEdit = () => {
    setProfileData(originalProfile);
    setIsEditing(false);
  };

  const getInitials = () => {
    return profileData.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Notification handlers
  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Security handlers
  const handleSecurityChange = (key, value) => {
    if (typeof value === 'boolean') {
      setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      setSecurity(prev => ({ ...prev, [key]: value }));
    }
  };

  // Password change
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    setPasswordSuccess('Password changed successfully!');
    setPasswordData({ current: '', new: '', confirm: '' });
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  // Appearance handlers
  const handleAppearanceChange = (key) => {
    setAppearance(prev => {
      const newValue = !prev[key];
      
      if (key === 'compactView') {
        if (newValue) {
          document.body.classList.add('compact-view');
        } else {
          document.body.classList.remove('compact-view');
        }
      }
      
      return { ...prev, [key]: newValue };
    });
  };

  const handleColorChange = (color) => {
    setAccentColor(color);
  };

  // Save all settings
  const handleSave = () => {
    // Profile is saved separately through handleSaveProfile
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    localStorage.setItem('securitySettings', JSON.stringify(security));
    localStorage.setItem('appearanceSettings', JSON.stringify(appearance));
    
    setSaveStatus('✓ Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      const defaultProfile = {
        name: user?.name || 'Your name',
        email: user?.email || 'name@example.com',
        phone: '+254 712 345 678',
        location: 'Nakuru, Kenya',
        bio: 'Financial enthusiast passionate about budgeting and saving for the future.',
        joinDate: 'January 2026',
        avatar: null
      };
      
      const defaultNotifications = {
        emailAlerts: true,
        pushNotifications: false,
        monthlyReports: true,
        budgetAlerts: true,
        goalReminders: true,
        marketingEmails: false
      };
      
      const defaultSecurity = {
        twoFactorAuth: false,
        sessionTimeout: '30',
        loginAlerts: true
      };
      
      const defaultAppearance = {
        compactView: false,
        showAvatars: true
      };
      
      setProfileData(defaultProfile);
      setOriginalProfile(defaultProfile);
      setNotifications(defaultNotifications);
      setSecurity(defaultSecurity);
      setAppearance(defaultAppearance);
      setAccentColor('#2DD4BF');
      
      document.body.classList.remove('compact-view');
      
      localStorage.clear();
      setSaveStatus('✓ Settings reset to default');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Export settings
  const handleExport = () => {
    const exportData = {
      profile: profileData,
      notifications: notifications,
      security: security,
      appearance: appearance,
      theme: theme,
      accentColor: accentColor,
      exportDate: new Date().toLocaleString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finlytics-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSaveStatus('✓ Settings exported successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Import settings
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          
          if (importedData.profile) {
            setProfileData(importedData.profile);
            setOriginalProfile(importedData.profile);
          }
          if (importedData.notifications) setNotifications(importedData.notifications);
          if (importedData.security) setSecurity(importedData.security);
          if (importedData.appearance) {
            setAppearance(importedData.appearance);
            if (importedData.appearance.compactView) {
              document.body.classList.add('compact-view');
            }
          }
          if (importedData.accentColor) setAccentColor(importedData.accentColor);
          
          setSaveStatus('✓ Settings imported successfully!');
          setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
          alert('Invalid settings file');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm('⚠️ Are you sure you want to clear ALL your data? This will reset all settings and cannot be undone!')) {
      localStorage.clear();
      
      const defaultProfile = {
        name: user?.name || 'Your name',
        email: user?.email || 'name@example.com',
        phone: '+254 712 345 678',
        location: 'Nakuru, Kenya',
        bio: 'Financial enthusiast passionate about budgeting and saving for the future.',
        joinDate: 'January 2026',
        avatar: null
      };
      
      setProfileData(defaultProfile);
      setOriginalProfile(defaultProfile);
      setNotifications({
        emailAlerts: true,
        pushNotifications: false,
        monthlyReports: true,
        budgetAlerts: true,
        goalReminders: true,
        marketingEmails: false
      });
      setSecurity({
        twoFactorAuth: false,
        sessionTimeout: '30',
        loginAlerts: true
      });
      setAppearance({
        compactView: false,
        showAvatars: true
      });
      setAccentColor('#2DD4BF');
      
      document.body.classList.remove('compact-view');
      
      setSaveStatus('✓ All data cleared');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Delete account
  const handleDeleteAccount = () => {
    if (window.confirm('⚠️⚠️⚠️ ARE YOU ABSOLUTELY SURE?\n\nDeleting your account will permanently remove all your data and cannot be undone!')) {
      if (window.confirm('This is your final warning. Type "DELETE" to confirm.')) {
        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation === 'DELETE') {
          localStorage.clear();
          alert('Your account has been deleted. Thank you for using Finlytics.');
          window.location.href = '/';
        }
      }
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account preferences and application settings</p>
        </div>
        {saveStatus && <div className="save-status">{saveStatus}</div>}
      </div>

      <div className="settings-card">
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            <span>Profile</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="tab-icon">🔔</span>
            <span>Notifications</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="tab-icon">🔒</span>
            <span>Security</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <span className="tab-icon">🎨</span>
            <span>Appearance</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <span className="tab-icon">📊</span>
            <span>Data</span>
          </button>
        </div>

        <div className="settings-content">
          {/* Profile Settings - Consolidated Profile View */}
          {activeTab === 'profile' && (
            <motion.div 
              className="profile-settings"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="profile-header-settings">
                <h2>Profile Information</h2>
                {!isEditing ? (
                  <button 
                    className="edit-profile-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <FiEdit2 /> Edit Profile
                  </button>
                ) : (
                  <div className="profile-edit-actions">
                    <button 
                      className="cancel-btn"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      className={`save-profile-btn ${isLoading ? 'loading' : ''}`}
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : <><FiSave /> Save Changes</>}
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-grid">
                {/* Left Column - Avatar & Stats */}
                <motion.div className="profile-left-col" variants={itemVariants}>
                  <div className="profile-avatar-card">
                    <div className="avatar-container">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="Profile" className="profile-avatar" />
                      ) : (
                        <div className="profile-avatar-placeholder">
                          {getInitials()}
                        </div>
                      )}
                      {isEditing && (
                        <label htmlFor="avatar-upload" className="avatar-upload-label">
                          <FiCamera className="upload-icon" />
                          <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="avatar-upload-input"
                          />
                        </label>
                      )}
                    </div>
                    <h3 className="profile-name-settings">{profileData.name}</h3>
                    <p className="profile-member-since">Member since {profileData.joinDate}</p>
                  </div>

                  <div className="profile-stats-card">
                    <div className="stat-item-settings">
                      <span className="stat-label-settings">Accounts</span>
                      <span className="stat-value-settings">3</span>
                    </div>
                    <div className="stat-item-settings">
                      <span className="stat-label-settings">Transactions</span>
                      <span className="stat-value-settings">156</span>
                    </div>
                    <div className="stat-item-settings">
                      <span className="stat-label-settings">Goals</span>
                      <span className="stat-value-settings">4</span>
                    </div>
                  </div>

                  <div className="profile-info-card-settings">
                    <h4>Account Details</h4>
                    <div className="info-item-settings">
                      <FiCalendar className="info-icon-settings" />
                      <div className="info-content-settings">
                        <span className="info-label-settings">Member Since</span>
                        <span className="info-value-settings">{profileData.joinDate}</span>
                      </div>
                    </div>
                    <div className="info-item-settings">
                      <FiUser className="info-icon-settings" />
                      <div className="info-content-settings">
                        <span className="info-label-settings">User ID</span>
                        <span className="info-value-settings">FIN-{user?.id || '12345'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - Edit Form */}
                <motion.div className="profile-right-col" variants={itemVariants}>
                  <div className="profile-form-card">
                    <div className="form-grid-settings">
                      {/* Full Name */}
                      <div className="form-group-settings">
                        <label>
                          <FiUser className="field-icon" />
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="form-input-settings"
                          />
                        ) : (
                          <div className="info-display-settings">{profileData.name}</div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="form-group-settings">
                        <label>
                          <FiMail className="field-icon" />
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className="form-input-settings"
                          />
                        ) : (
                          <div className="info-display-settings">{profileData.email}</div>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="form-group-settings">
                        <label>
                          <FiPhone className="field-icon" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            className="form-input-settings"
                          />
                        ) : (
                          <div className="info-display-settings">{profileData.phone}</div>
                        )}
                      </div>

                      {/* Location */}
                      <div className="form-group-settings">
                        <label>
                          <FiMapPin className="field-icon" />
                          Location
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="location"
                            value={profileData.location}
                            onChange={handleInputChange}
                            placeholder="Enter your location"
                            className="form-input-settings"
                          />
                        ) : (
                          <div className="info-display-settings">{profileData.location}</div>
                        )}
                      </div>

                      {/* Bio */}
                      <div className="form-group-settings full-width">
                        <label>Bio</label>
                        {isEditing ? (
                          <textarea
                            name="bio"
                            value={profileData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us a little about yourself"
                            rows="4"
                            className="form-textarea-settings"
                          />
                        ) : (
                          <div className="info-display-settings bio-display-settings">{profileData.bio}</div>
                        )}
                      </div>

                      {/* Financial Stats */}
                      <div className="stats-grid-settings full-width">
                        <div className="stat-card-settings">
                          <span className="stat-card-label">Total Saved</span>
                          <span className="stat-card-value">$12,450</span>
                        </div>
                        <div className="stat-card-settings">
                          <span className="stat-card-label">Monthly Average</span>
                          <span className="stat-card-value">$2,075</span>
                        </div>
                        <div className="stat-card-settings">
                          <span className="stat-card-label">Goals Achieved</span>
                          <span className="stat-card-value">2/4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <div className="settings-list">
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Email Alerts</span>
                    <span className="row-description">Receive important alerts via email</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.emailAlerts}
                      onChange={() => handleNotificationChange('emailAlerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Push Notifications</span>
                    <span className="row-description">Browser push notifications</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.pushNotifications}
                      onChange={() => handleNotificationChange('pushNotifications')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Monthly Reports</span>
                    <span className="row-description">Receive monthly financial summaries</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.monthlyReports}
                      onChange={() => handleNotificationChange('monthlyReports')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Budget Alerts</span>
                    <span className="row-description">Get notified when nearing budget limits</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.budgetAlerts}
                      onChange={() => handleNotificationChange('budgetAlerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Goal Reminders</span>
                    <span className="row-description">Reminders for financial goals</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={notifications.goalReminders}
                      onChange={() => handleNotificationChange('goalReminders')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="security-password-section">
                <h3>Change Password</h3>
                <div className="settings-grid">
                  <div className="settings-field">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="current"
                        value={passwordData.current}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  <div className="settings-field">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="new"
                        value={passwordData.new}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  <div className="settings-field">
                    <label>Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirm"
                        value={passwordData.confirm}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  {passwordError && <div className="error-message">{passwordError}</div>}
                  {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                  <div className="settings-field">
                    <button className="btn btn-primary" onClick={handleChangePassword}>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-list" style={{ marginTop: '32px' }}>
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Two-Factor Authentication</span>
                    <span className="row-description">Add an extra layer of security</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={security.twoFactorAuth}
                      onChange={() => handleSecurityChange('twoFactorAuth')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Session Timeout</span>
                    <span className="row-description">Auto-logout after inactivity</span>
                  </div>
                  <select 
                    className="timeout-select"
                    value={security.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Login Alerts</span>
                    <span className="row-description">Get email alerts for new logins</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={security.loginAlerts}
                      onChange={() => handleSecurityChange('loginAlerts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              
              <div className="settings-row" style={{ marginBottom: '24px', background: 'transparent', padding: 0 }}>
                <div className="row-info">
                  <span className="row-title">Dark Mode</span>
                  <span className="row-description">Switch between light and dark themes</span>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="theme-preview-card">
                <div className="theme-preview-content">
                  <div className="theme-color-preview" style={{ backgroundColor: accentColor }}></div>
                  <div className="theme-text-preview">
                    <h4>{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</h4>
                    <p>Accent color: {colorOptions.find(c => c.value === accentColor)?.name || 'Teal'}</p>
                  </div>
                </div>
              </div>

              <div className="settings-field" style={{ marginBottom: '24px' }}>
                <label>Accent Color</label>
                <div className="color-options">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`color-dot ${accentColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorChange(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="settings-list">
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Compact View</span>
                    <span className="row-description">Show more content with less spacing</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={appearance.compactView}
                      onChange={() => handleAppearanceChange('compactView')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Show Avatars</span>
                    <span className="row-description">Display user avatars throughout the app</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={appearance.showAvatars}
                      onChange={() => handleAppearanceChange('showAvatars')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <div className="settings-section">
              <h2>Data Management</h2>
              <div className="data-actions">
                <div className="data-action-card">
                  <div className="action-info">
                    <span className="action-title">Export Settings</span>
                    <span className="action-description">Download all your settings as JSON backup</span>
                  </div>
                  <button className="btn btn-secondary" onClick={handleExport}>Export</button>
                </div>

                <div className="data-action-card">
                  <div className="action-info">
                    <span className="action-title">Import Settings</span>
                    <span className="action-description">Import settings from JSON backup</span>
                  </div>
                  <button className="btn btn-secondary" onClick={handleImport}>Import</button>
                </div>

                <div className="data-action-card warning">
                  <div className="action-info">
                    <span className="action-title">Clear All Data</span>
                    <span className="action-description">Permanently delete all your settings and data</span>
                  </div>
                  <button className="btn btn-danger" onClick={handleClearAllData}>Clear All</button>
                </div>

                <div className="data-action-card danger">
                  <div className="action-info">
                    <span className="action-title">Delete Account</span>
                    <span className="action-description">Permanently delete your account and all data</span>
                  </div>
                  <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={handleReset}>Reset to Default</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;