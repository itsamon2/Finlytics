import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './UserMenu.css';

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    { icon: '👤', label: 'My Profile', path: '/settings?tab=profile' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="user-menu-container">
      <button 
        className="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="user-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="avatar-image" />
          ) : (
            <div className="avatar-initials">
              {getInitials()}
            </div>
          )}
        </div>
        <span className="user-name">{user?.name?.split(' ')[0] || 'User'}</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              className="user-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <span className="dropdown-user-name">{user?.name || 'User'}</span>
                  <span className="dropdown-user-email">{user?.email || 'user@example.com'}</span>
                </div>
              </div>

              <div className="dropdown-menu">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="dropdown-item-icon">{item.icon}</span>
                    <span className="dropdown-item-label">{item.label}</span>
                  </button>
                ))}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <span className="dropdown-item-icon">🚪</span>
                  <span className="dropdown-item-label">Logout</span>
                </button>
              </div>
            </motion.div>
            <div className="user-menu-overlay" onClick={() => setIsOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;