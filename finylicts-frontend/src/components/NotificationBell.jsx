import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../service/api';
import Loader from './Loader';
import './NotificationIcon.css';

const NotificationBell = () => {
  const navigate                              = useNavigate();
  const [showDropdown, setShowDropdown]       = useState(false);
  const [notifications, setNotifications]     = useState([]);
  const [unreadCount,   setUnreadCount]       = useState(0);
  const [loading,       setLoading]           = useState(false);
  const dropdownRef                           = useRef(null);

  const fetchUnreadCount = () => {
    notificationService.getUnreadCount()
      .then(data => setUnreadCount(data.count))
      .catch(() => {});
  };

  const fetchLatest = () => {
    setLoading(true);
    notificationService.getLatest()
      .then(data => {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = (e) => {
    e.stopPropagation();
    const opening = !showDropdown;
    setShowDropdown(opening);
    if (opening) fetchLatest();
  };

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    notificationService.markAsRead(id)
      .then(() => {
        setNotifications(prev =>
          prev.map(n => n.notificationId === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      })
      .catch(() => {});
  };

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    notificationService.markAllAsRead()
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      })
      .catch(() => {});
  };

  const handleViewAll = () => {
    navigate('/notifications');
    setShowDropdown(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CONTRIBUTION':    return '🔔';
      case 'BUDGET_EXCEEDED': return '⚠️';
      case 'GOAL_MILESTONE':  return '🎯';
      default:                return '📢';
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const diff  = Date.now() - new Date(createdAt).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="notification-container" ref={dropdownRef}>

      <button className="notification-bell" onClick={handleBellClick} aria-label="Notifications">
        <svg className="bell-icon" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2">
          <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214
                   13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214
                   4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
          <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946
                   21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044
                   11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <motion.div className="notification-dropdown"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {loading ? (
                  <Loader fullPage={false} message="Loading notifications..." />
                ) : notifications.length === 0 ? (
                  <div className="notification-empty">No notifications yet 🎉</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.notificationId}
                      className={`notification-item ${notif.type?.toLowerCase()} ${!notif.read ? 'unread' : ''}`}>
                      <div className="notification-content">
                        <div className="notification-item-header">
                          <span className="notification-type-icon">{getTypeIcon(notif.type)}</span>
                          <span className="notification-title">{notif.title}</span>
                          {!notif.read && (
                            <button className="mark-read-dot"
                              onClick={(e) => handleMarkAsRead(e, notif.notificationId)}
                              title="Mark as read" />
                          )}
                        </div>
                        <span className="notification-message">{notif.message}</span>
                        <span className="notification-time">{formatTime(notif.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="notification-footer">
                <button onClick={handleViewAll}>View All Notifications</button>
              </div>
            </motion.div>

            <div className="notification-overlay" onClick={() => setShowDropdown(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;