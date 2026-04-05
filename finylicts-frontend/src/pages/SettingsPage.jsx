import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiSave, FiEdit2, FiEye, FiEyeOff } from 'react-icons/fi';
import { userService } from '../service/api';
import './Settings.styles.css';

const SettingsPage = () => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab]   = useState('profile');
  const [saveStatus, setSaveStatus] = useState('');

  // ── Profile ───────────────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', profilePhoto: '',
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  // ── Password ──────────────────────────────────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [passwordError, setPasswordError]     = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  // ── Appearance ────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      budgetAlerts: true, goalReminders: true,
    };
  });

  const colorOptions = [
    { name: 'Teal',   value: '#2DD4BF' },
    { name: 'Blue',   value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green',  value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink',   value: '#EC4899' },
    { name: 'Red',    value: '#EF4444' },
  ];

  // ── Load profile from backend on mount ────────────────────────────────────
  useEffect(() => {
    userService.getProfile()
      .then(data => {
        const profile = {
          firstName:    data.firstName    || '',
          lastName:     data.lastName     || '',
          email:        data.email        || '',
          phoneNumber:  data.phoneNumber  || '',
          profilePhoto: data.profilePhoto || '',
        };
        setProfileData(profile);
        setOriginalProfile(profile);
      })
      .catch(() => {
        // fallback to auth context if endpoint fails
        if (user) {
          const profile = {
            firstName:    user.firstName || user.name?.split(' ')[0] || '',
            lastName:     user.lastName  || user.name?.split(' ')[1] || '',
            email:        user.email     || '',
            phoneNumber:  '',
            profilePhoto: '',
          };
          setProfileData(profile);
          setOriginalProfile(profile);
        }
      });
  }, []);

  const getInitials = () => {
    const first = profileData.firstName?.[0] || '';
    const last  = profileData.lastName?.[0]  || '';
    return (first + last).toUpperCase() || '?';
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    setIsLoading(true);
    userService.updateProfile({
      firstName:    profileData.firstName,
      lastName:     profileData.lastName,
      phoneNumber:  profileData.phoneNumber,
      profilePhoto: profileData.profilePhoto,
    })
      .then(updated => {
        setOriginalProfile(profileData);
        setIsEditing(false);
        setSaveStatus('✓ Profile updated successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      })
      .catch(() => {
        setSaveStatus('✗ Failed to update profile');
        setTimeout(() => setSaveStatus(''), 3000);
      })
      .finally(() => setIsLoading(false));
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    userService.changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword:     passwordData.newPassword,
    })
      .then(res => {
        if (res.success) {
          setPasswordSuccess('Password changed successfully!');
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setTimeout(() => setPasswordSuccess(''), 3000);
        } else {
          setPasswordError(res.message || 'Failed to change password');
        }
      })
      .catch(() => setPasswordError('Failed to change password'));
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      const confirmation = prompt('Type "DELETE" to confirm:');
      if (confirmation === 'DELETE') {
        userService.deleteAccount()
          .then(() => {
            logout();
            window.location.href = '/login';
          })
          .catch(() => alert('Failed to delete account. Please try again.'));
      }
    }
  };

  // ── Save notification preferences ─────────────────────────────────────────
  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    setSaveStatus('✓ Preferences saved!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
        {saveStatus && <div className="save-status">{saveStatus}</div>}
      </div>

      <div className="settings-card">
        {/* ── Tabs ── */}
        <div className="settings-tabs">
          {[
            { id: 'profile',     icon: '👤', label: 'Profile'     },
            { id: 'security',    icon: '🔒', label: 'Security'    },
            { id: 'appearance',  icon: '🎨', label: 'Appearance'  },
            { id: 'notifications', icon: '🔔', label: 'Notifications' },
            { id: 'data',        icon: '📊', label: 'Data'        },
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <motion.div className="settings-section"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="profile-header-settings">
                <h2>Profile Information</h2>
                {!isEditing ? (
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    <FiEdit2 /> Edit Profile
                  </button>
                ) : (
                  <div className="profile-edit-actions">
                    <button className="cancel-btn"
                            onClick={() => { setProfileData(originalProfile); setIsEditing(false); }}
                            disabled={isLoading}>
                      Cancel
                    </button>
                    <button className="save-profile-btn"
                            onClick={handleSaveProfile}
                            disabled={isLoading}>
                      {isLoading ? 'Saving...' : <><FiSave /> Save Changes</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="avatar-section">
                <div className="avatar-container">
                  {profileData.profilePhoto ? (
                    <img src={profileData.profilePhoto} alt="Profile"
                         className="profile-avatar" />
                  ) : (
                    <div className="profile-avatar-placeholder">{getInitials()}</div>
                  )}
                </div>
                <div>
                  <h3>{profileData.firstName} {profileData.lastName}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {profileData.email}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="settings-grid">
                <div className="settings-field">
                  <label><FiUser className="field-icon" /> First Name</label>
                  {isEditing ? (
                    <input className="form-input-settings"
                      value={profileData.firstName}
                      onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="First name" />
                  ) : (
                    <div className="info-display-settings">{profileData.firstName || '—'}</div>
                  )}
                </div>

                <div className="settings-field">
                  <label><FiUser className="field-icon" /> Last Name</label>
                  {isEditing ? (
                    <input className="form-input-settings"
                      value={profileData.lastName}
                      onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Last name" />
                  ) : (
                    <div className="info-display-settings">{profileData.lastName || '—'}</div>
                  )}
                </div>

                <div className="settings-field">
                  <label><FiMail className="field-icon" /> Email</label>
                  {/* Email is not editable — changing email is a security-sensitive operation */}
                  <div className="info-display-settings">{profileData.email}</div>
                </div>

                <div className="settings-field">
                  <label><FiPhone className="field-icon" /> Phone Number</label>
                  {isEditing ? (
                    <input className="form-input-settings"
                      value={profileData.phoneNumber}
                      onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      placeholder="+254 7XX XXX XXX" />
                  ) : (
                    <div className="info-display-settings">{profileData.phoneNumber || '—'}</div>
                  )}
                </div>

                <div className="settings-field full-width">
                  <label>Profile Photo URL</label>
                  {isEditing ? (
                    <input className="form-input-settings"
                      value={profileData.profilePhoto}
                      onChange={e => setProfileData({ ...profileData, profilePhoto: e.target.value })}
                      placeholder="https://..." />
                  ) : (
                    <div className="info-display-settings">
                      {profileData.profilePhoto || 'No photo set'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <motion.div className="settings-section"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2>Change Password</h2>
              <div className="settings-grid">
                <div className="settings-field">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <button type="button" className="password-toggle"
                            onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password (min 8 chars)"
                    />
                    <button type="button" className="password-toggle"
                            onClick={() => setShowNew(!showNew)}>
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label>Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    <button type="button" className="password-toggle"
                            onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {passwordError   && <div className="error-message">{passwordError}</div>}
                {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

                <div className="settings-field">
                  <button className="btn btn-primary" onClick={handleChangePassword}>
                    Change Password
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Appearance Tab ── */}
          {activeTab === 'appearance' && (
            <motion.div className="settings-section"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2>Appearance</h2>

              <div className="settings-list">
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Dark Mode</span>
                    <span className="row-description">Switch between light and dark themes</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox"
                           checked={theme === 'dark'}
                           onChange={toggleTheme} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="settings-field" style={{ marginTop: '24px' }}>
                <label>Accent Color</label>
                <div className="color-options">
                  {colorOptions.map(color => (
                    <button key={color.value}
                      className={`color-dot ${accentColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setAccentColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <motion.div className="settings-section"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2>Notification Preferences</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                These control which in-app notifications you receive.
              </p>

              <div className="settings-list">
                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Budget Alerts</span>
                    <span className="row-description">Get notified when a budget is exceeded</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox"
                           checked={notifications.budgetAlerts}
                           onChange={() => setNotifications(prev =>
                             ({ ...prev, budgetAlerts: !prev.budgetAlerts }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-row">
                  <div className="row-info">
                    <span className="row-title">Goal Reminders</span>
                    <span className="row-description">Get notified when a contribution is due</span>
                  </div>
                  <label className="toggle">
                    <input type="checkbox"
                           checked={notifications.goalReminders}
                           onChange={() => setNotifications(prev =>
                             ({ ...prev, goalReminders: !prev.goalReminders }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={handleSaveNotifications}>
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Data Tab ── */}
          {activeTab === 'data' && (
            <motion.div className="settings-section"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2>Data Management</h2>

              <div className="data-actions">
                <div className="data-action-card danger">
                  <div className="action-info">
                    <span className="action-title">Delete Account</span>
                    <span className="action-description">
                      Permanently delete your account and all associated data.
                      This cannot be undone.
                    </span>
                  </div>
                  <button className="btn btn-danger" onClick={handleDeleteAccount}>
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;