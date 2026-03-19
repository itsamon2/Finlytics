import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Transactions', path: '/transactions', icon: '💰' },
    { name: 'Budgets', path: '/budgets', icon: '📋' },
    { name: 'Goals', path: '/goals', icon: '🎯' },
    { name: 'Analysis', path: '/analysis', icon: '📈' },
    { name: 'Tools', path: '/tools', icon: '🛠️' },
    { name: 'Reports', path: '/reports', icon: '📑' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Finlytics</h2>
        <span>Welcome, {user?.name || 'User'}</span>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.name}
              className={isActive(item.path) ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <ul>
          <li 
            className={isActive('/settings') ? 'active' : ''}
            onClick={() => navigate('/settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </li>
          <li onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;