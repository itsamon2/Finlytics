import React, { useState, useEffect } from 'react';
import { notificationService } from '../service/api';
import Loader from '../components/Loader';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [filter, setFilter]               = useState('ALL');

  const fetchNotifications = () => {
    notificationService.getAll()
      .then(data => { setNotifications(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAsRead = (id) => {
    notificationService.markAsRead(id)
      .then(() => setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, read: true } : n)))
      .catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead()
      .then(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))))
      .catch(() => {});
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL')    return true;
    if (filter === 'UNREAD') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon  = (type) => ({ CONTRIBUTION:'🔔', BUDGET_EXCEEDED:'⚠️', GOAL_MILESTONE:'🎯' }[type] || '📢');
  const getTypeLabel = (type) => ({ CONTRIBUTION:'Contribution', BUDGET_EXCEEDED:'Budget', GOAL_MILESTONE:'Milestone' }[type] || 'General');

  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const diff  = Date.now() - new Date(createdAt).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  if (loading) return <Loader fullPage={false} message="Loading notifications..." />;
  if (error)   return <div className="error">Error: {error}</div>;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p className="header-subtitle">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-read-btn" onClick={handleMarkAllAsRead}>Mark all as read</button>
        )}
      </div>

      <div className="notification-filters">
        {['ALL', 'UNREAD', 'CONTRIBUTION', 'BUDGET_EXCEEDED', 'GOAL_MILESTONE'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'ALL'             && '📋 All'}
            {f === 'UNREAD'          && `🔵 Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
            {f === 'CONTRIBUTION'    && '🔔 Contributions'}
            {f === 'BUDGET_EXCEEDED' && '⚠️ Budgets'}
            {f === 'GOAL_MILESTONE'  && '🎯 Milestones'}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="no-notifications">
          <p>No {filter === 'ALL' ? '' : filter.toLowerCase()} notifications yet 🎉</p>
        </div>
      )}

      <div className="notifications-list">
        {filteredNotifications.map(notif => (
          <div key={notif.notificationId}
            className={`notification-card ${notif.type?.toLowerCase()} ${!notif.read ? 'unread' : ''}`}>
            <div className="notification-card-content">
              <div className="notification-card-header">
                <div className="notification-card-title">
                  <span className="notification-type-icon">{getTypeIcon(notif.type)}</span>
                  <h3>{notif.title}</h3>
                  <span className={`type-badge ${notif.type?.toLowerCase()}`}>{getTypeLabel(notif.type)}</span>
                </div>
                <span className="notification-time">{formatTime(notif.createdAt)}</span>
              </div>
              <p className="notification-message">{notif.message}</p>
            </div>
            {!notif.read && (
              <div className="notification-card-actions">
                <button className="mark-single-read-btn" onClick={() => handleMarkAsRead(notif.notificationId)}>Mark as read</button>
              </div>
            )}
            {!notif.read && <span className="unread-dot"></span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;