import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './NotificationIcon.css';

const NotificationBell = ({ count = 3 }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample notifications..... these would come from context/state
  const notifications = [
    { id: 1, title: 'Overspending Alert', message: 'Food budget exceeded by $120', time: '2 min ago', read: false, type: 'warning' },
    { id: 2, title: 'Goal Milestone', message: 'Emergency fund is 57% complete!', time: '1 hour ago', read: false, type: 'success' },
    { id: 3, title: 'Bill Reminder', message: 'Rent payment due in 3 days', time: '5 hours ago', read: false, type: 'info' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    navigate('/notifications');
    setShowNotifications(false);
  };

  const handleBellClick = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="notification-container">
      <button 
        className="notification-bell"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
          <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              className="notification-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="notification-header">
                <h3>Notifications</h3>
                <span className="notification-count">{unreadCount} new</span>
              </div>
              <div className="notification-list">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${!notif.read ? 'unread' : ''} ${notif.type}`}
                    onClick={handleNotificationClick}
                  >
                    <div className="notification-content">
                      <span className="notification-title">{notif.title}</span>
                      <span className="notification-message">{notif.message}</span>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notification-footer">
                <button onClick={handleNotificationClick}>View All Notifications</button>
              </div>
            </motion.div>
            <div className="notification-overlay" onClick={() => setShowNotifications(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;