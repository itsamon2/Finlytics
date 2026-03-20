import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuSections = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Transactions', path: '/transactions', icon: '💰' },
        { name: 'Budgets', path: '/budgets', icon: '📋' },
        { name: 'Goals', path: '/goals', icon: '🎯' }
      ]
    },
    {
      title: 'ANALYSIS',
      items: [
        { name: 'Feasibility', path: '/feasibility', icon: '📈' },
        { name: 'Advisory', path: '/advisory', icon: '💡' },
        { name: 'Scenarios', path: '/scenarios', icon: '🔄' }
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { name: 'Tax & Health', path: '/tax-health', icon: '🏥' },
        { name: 'Reports', path: '/reports', icon: '📑' }
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mobile menu toggle button
  const MenuToggle = () => (
    <button 
      className={`menu-toggle ${isOpen ? 'open' : ''}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );

  return (
    <>
      {isMobile && <MenuToggle />}
      
      <aside className={`sidebar ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>Finlytics</h2>
          {!isMobile && <span>Welcome, {user?.name?.split(' ')[0] || 'User'}</span>}
        </div>
        
        <nav className="sidebar-nav">
          {menuSections.map((section, index) => (
            <div key={index} className="nav-section">
              {!isMobile && <h3 className="section-title">{section.title}</h3>}
              <ul>
                {section.items.map((item) => (
                  <li 
                    key={item.name}
                    className={isActive(item.path) ? 'active' : ''}
                    onClick={() => handleNavigation(item.path)}
                    title={isMobile ? item.name : ''}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!isMobile && <span className="nav-text">{item.name}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <ul>
            <li 
              className={isActive('/settings') ? 'active' : ''}
              onClick={() => handleNavigation('/settings')}
              title={isMobile ? 'Settings' : ''}
            >
              <span className="nav-icon">⚙️</span>
              {!isMobile && <span className="nav-text">Settings</span>}
            </li>
            <li onClick={handleLogout} title={isMobile ? 'Logout' : ''}>
              <span className="nav-icon">🚪</span>
              {!isMobile && <span className="nav-text">Logout</span>}
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
};

export default Sidebar;