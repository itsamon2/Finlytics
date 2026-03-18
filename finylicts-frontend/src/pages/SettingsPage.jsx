import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Settings.styles.css';

const SettingsPage = () => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState('');
  
  // Profile settings
  const [profileForm, setProfileForm] = useState(() => {
    const saved = localStorage.getItem('profileSettings');
    return saved ? JSON.parse(saved) : {
      name: 'Munchkin',
      email: 'munchkin@example.com',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      language: 'English'
    };
  });

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

  const colorOptions = [
    { name: 'Teal', value: '#2DD4BF' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' }
  ];

  // Load settings from localStorage on mount
  useEffect(() => {
    if (appearance.compactView) {
      document.body.classList.add('compact-view');
    } else {
      document.body.classList.remove('compact-view');
    }
  }, [appearance.compactView]);

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
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
    
    // Validation
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
    
    // For now, we'll just show success
    setPasswordSuccess('Password changed successfully!');
    setPasswordData({ current: '', new: '', confirm: '' });
    
    // Clear success message after 3 seconds
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  // Save all settings
  const handleSave = () => {
    localStorage.setItem('profileSettings', JSON.stringify(profileForm));
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
        name: 'Munchkin',
        email: 'munchkin@example.com',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        language: 'English'
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
      
      setProfileForm(defaultProfile);
      setNotifications(defaultNotifications);
      setSecurity(defaultSecurity);
      setAppearance(defaultAppearance);
      setAccentColor('#2DD4BF');
      
      document.body.classList.remove('compact-view');
      
      // Save defaults to localStorage
      localStorage.setItem('profileSettings', JSON.stringify(defaultProfile));
      localStorage.setItem('notificationSettings', JSON.stringify(defaultNotifications));
      localStorage.setItem('securitySettings', JSON.stringify(defaultSecurity));
      localStorage.setItem('appearanceSettings', JSON.stringify(defaultAppearance));
      localStorage.setItem('accentColor', '#2DD4BF');
      
      setSaveStatus('✓ Settings reset to default');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Export settings
  const handleExport = () => {
    const exportData = {
      profile: profileForm,
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
          
          if (importedData.profile) setProfileForm(importedData.profile);
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
      
      // Reset to defaults
      setProfileForm({
        name: 'Munchkin',
        email: 'munchkin@example.com',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        language: 'English'
      });
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
          // In a real app, you'd redirect to login page
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
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <div className="settings-grid">
                <div className="settings-field">
                  <label>Display Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Your name"
                  />
                </div>
                <div className="settings-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="settings-field">
                  <label>Currency</label>
                  <select name="currency" value={profileForm.currency} onChange={handleProfileChange}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="KES">KES (Ksh)</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>Date Format</label>
                  <select name="dateFormat" value={profileForm.dateFormat} onChange={handleProfileChange}>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>Language</label>
                  <select name="language" value={profileForm.language} onChange={handleProfileChange}>
                    <option value="English">English</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                    <option value="German">Deutsch</option>
                    <option value="Swahili">Kiswahili</option>
                  </select>
                </div>
              </div>
            </div>
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
              
              {/* Password Change Section */}
              <div className="security-password-section">
                <h3>Change Password</h3>
                <div className="settings-grid">
                  <div className="settings-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="current"
                      value={passwordData.current}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="settings-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={passwordData.new}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="settings-field">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={passwordData.confirm}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />
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

              {/* Security Options */}
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
              
              {/* Dark Mode Toggle */}
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

              {/* Theme Preview */}
              <div className="theme-preview-card">
                <div className="theme-preview-content">
                  <div className="theme-color-preview" style={{ backgroundColor: accentColor }}></div>
                  <div className="theme-text-preview">
                    <h4>{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</h4>
                    <p>Accent color: {colorOptions.find(c => c.value === accentColor)?.name || 'Teal'}</p>
                  </div>
                </div>
              </div>

              {/* Accent Color Selection */}
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

              {/* Other Appearance Options */}
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