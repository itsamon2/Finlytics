// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCamera, FiSave, FiEdit2 } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    joinDate: '',
    avatar: null
  });
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user data from auth context
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
      setOriginalData(userProfile);
    }
  }, [user]);

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

  const handleSave = async () => {
    setIsLoading(true);
    setSaveSuccess(false);
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      setOriginalData(profileData);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    
    setIsLoading(false);
  };

  const handleCancel = () => {
    setProfileData(originalData);
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

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
        <p className="profile-subtitle">Manage your personal information</p>
      </div>

      <motion.div 
        className="profile-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column - Avatar & Stats */}
        <motion.div className="profile-left" variants={itemVariants}>
          <div className="profile-avatar-section">
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
            <h2 className="profile-name">{profileData.name}</h2>
            <p className="profile-role">Member since {profileData.joinDate}</p>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Accounts</span>
              <span className="stat-value">3</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Transactions</span>
              <span className="stat-value">156</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Goals</span>
              <span className="stat-value">4</span>
            </div>
          </div>

          <div className="profile-info-card">
            <h3>Account Information</h3>
            <div className="info-item">
              <FiCalendar className="info-icon" />
              <div className="info-content">
                <span className="info-label">Member Since</span>
                <span className="info-value">{profileData.joinDate}</span>
              </div>
            </div>
            <div className="info-item">
              <FiUser className="info-icon" />
              <div className="info-content">
                <span className="info-label">User ID</span>
                <span className="info-value">FIN-{user?.id || '12345'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Edit Form */}
        <motion.div className="profile-right" variants={itemVariants}>
          <div className="profile-edit-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button 
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit2 /> Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="cancel-button"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`save-button ${isLoading ? 'loading' : ''}`}
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : <><FiSave /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>

            {saveSuccess && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ✓ Profile updated successfully!
              </motion.div>
            )}

            <div className="form-grid">
              {/* Full Name */}
              <div className="form-group">
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
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">{profileData.name}</div>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
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
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">{profileData.email}</div>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
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
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">{profileData.phone}</div>
                )}
              </div>

              {/* Location */}
              <div className="form-group">
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
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">{profileData.location}</div>
                )}
              </div>

              {/* Bio */}
              <div className="form-group full-width">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us a little about yourself"
                    rows="4"
                    className="form-textarea"
                  />
                ) : (
                  <div className="info-display bio-display">{profileData.bio}</div>
                )}
              </div>

              {/* Account Statistics */}
              <div className="stats-grid full-width">
                <div className="stat-card">
                  <span className="stat-card-label">Total Saved</span>
                  <span className="stat-card-value">$12,450</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card-label">Monthly Average</span>
                  <span className="stat-card-value">$2,075</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card-label">Goals Achieved</span>
                  <span className="stat-card-value">2/4</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;