import React, { useState } from 'react';
import './Settings.styles.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: 'Munchkin',
    email: 'munchkin@example.com',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'English'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    monthlyReports: true,
    budgetAlerts: true,
    goalReminders: true,
    marketingEmails: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactView: false,
    showAvatars: true,
    colorScheme: 'teal'
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityChange = (key, value) => {
    if (typeof value === 'boolean') {
      setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      setSecurity(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleAppearanceChange = (key, value) => {
    if (typeof value === 'boolean') {
      setAppearance(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      setAppearance(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      alert('Settings reset to default');
    }
  };

  const handleExport = () => {
    alert('Export functionality will be implemented here');
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account preferences and application settings</p>
        </div>
      </div>

      {/* Settings Container */}
      <div className="settings-card">
        {/* Settings Navigation Tabs */}
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

        {/* Settings Content */}
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
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
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
              
              <div className="settings-grid">
                <div className="settings-field">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" />
                </div>

                <div className="settings-field">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>

                <div className="settings-field">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>

                <div className="settings-field">
                  <button className="btn btn-outline" style={{ marginTop: '24px' }}>
                    Change Password
                  </button>
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
              
              <div className="settings-grid">
                <div className="settings-field">
                  <label>Theme</label>
                  <div className="theme-options">
                    <button 
                      className={`theme-option ${appearance.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('theme', 'light')}
                    >
                      <span className="theme-preview light"></span>
                      <span>Light</span>
                    </button>
                    <button 
                      className={`theme-option ${appearance.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('theme', 'dark')}
                    >
                      <span className="theme-preview dark"></span>
                      <span>Dark</span>
                    </button>
                    <button 
                      className={`theme-option ${appearance.theme === 'system' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('theme', 'system')}
                    >
                      <span className="theme-preview system"></span>
                      <span>System</span>
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label>Accent Color</label>
                  <div className="color-options">
                    <button 
                      className={`color-dot teal ${appearance.colorScheme === 'teal' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('colorScheme', 'teal')}
                    ></button>
                    <button 
                      className={`color-dot blue ${appearance.colorScheme === 'blue' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('colorScheme', 'blue')}
                    ></button>
                    <button 
                      className={`color-dot purple ${appearance.colorScheme === 'purple' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('colorScheme', 'purple')}
                    ></button>
                    <button 
                      className={`color-dot green ${appearance.colorScheme === 'green' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('colorScheme', 'green')}
                    ></button>
                    <button 
                      className={`color-dot orange ${appearance.colorScheme === 'orange' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('colorScheme', 'orange')}
                    ></button>
                  </div>
                </div>
              </div>

              <div className="settings-list" style={{ marginTop: '24px' }}>
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
                    <span className="action-title">Export All Data</span>
                    <span className="action-description">Download all your financial data as CSV</span>
                  </div>
                  <button className="btn btn-secondary" onClick={handleExport}>Export</button>
                </div>

                <div className="data-action-card">
                  <div className="action-info">
                    <span className="action-title">Import Data</span>
                    <span className="action-description">Import transactions from CSV file</span>
                  </div>
                  <button className="btn btn-secondary">Import</button>
                </div>

                <div className="data-action-card warning">
                  <div className="action-info">
                    <span className="action-title">Clear All Data</span>
                    <span className="action-description">Permanently delete all your financial data</span>
                  </div>
                  <button className="btn btn-danger">Clear</button>
                </div>

                <div className="data-action-card danger">
                  <div className="action-info">
                    <span className="action-title">Delete Account</span>
                    <span className="action-description">Permanently delete your account and all data</span>
                  </div>
                  <button className="btn btn-danger">Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={handleReset}>Reset to Default</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;