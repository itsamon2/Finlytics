import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen,   setIsOpen]   = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add/remove a body class so the header can hide its controls via CSS
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add('sidebar-is-open');
    } else {
      document.body.classList.remove('sidebar-is-open');
    }
    // Clean up on unmount
    return () => document.body.classList.remove('sidebar-is-open');
  }, [isMobile, isOpen]);

  const menuSections = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard',    path: '/dashboard',    icon: '📊' },
        { name: 'Transactions', path: '/transactions', icon: '💰' },
        { name: 'Budgets',      path: '/budgets',      icon: '📋' },
        { name: 'Goals',        path: '/goals',        icon: '🎯' },
      ],
    },
    {
      title: 'ANALYSIS',
      items: [
        { name: 'Scenarios', path: '/scenarios', icon: '🔄' },
      ],
    },
    {
      title: 'TOOLS',
      items: [
        { name: 'Tax & Health', path: '/tax-health', icon: '🏥' },
        { name: 'Reports',      path: '/reports',    icon: '📑' },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path ||
    location.pathname.startsWith(path + '/');

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile hamburger — only shown when sidebar is closed */}
      {isMobile && !isOpen && (
        <button
          className="menu-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
      )}

      <aside className={`sidebar ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-top">
            <h2>Finlytics</h2>
            {isMobile && (
              <button
                className="sidebar-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            )}
          </div>
          <span>Welcome, {user?.name?.split(' ')[0] || 'User'}</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {menuSections.map((section, i) => (
            <div key={i} className="nav-section">
              <h3 className="section-title">{section.title}</h3>
              <ul>
                {section.items.map(item => (
                  <li
                    key={item.name}
                    className={isActive(item.path) ? 'active' : ''}
                    onClick={() => handleNavigation(item.path)}
                    title={item.name}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <ul>
            <li
              className={isActive('/settings') ? 'active' : ''}
              onClick={() => handleNavigation('/settings')}
              title="Settings"
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </li>
            <li onClick={handleLogout} title="Logout">
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Logout</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay — closes sidebar when tapping outside */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;