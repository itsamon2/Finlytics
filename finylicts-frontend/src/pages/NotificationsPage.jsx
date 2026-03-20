import React from 'react';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const notifications = [
    { id: 1, title: 'Overspending Alert', message: 'Food budget exceeded by $120 this month', time: '2 minutes ago', type: 'warning', read: false },
    { id: 2, title: 'Goal Milestone', message: 'Emergency fund is 57% complete!', time: '1 hour ago', type: 'success', read: false },
    { id: 3, title: 'Bill Reminder', message: 'Rent payment due in 3 days', time: '5 hours ago', type: 'info', read: false },
    { id: 4, title: 'Budget Alert', message: 'Transport budget at 85%', time: '1 day ago', type: 'warning', read: true },
    { id: 5, title: 'Savings Goal', message: 'You\'re 50% to your vacation goal!', time: '2 days ago', type: 'success', read: true },
  ];

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <button className="mark-read-btn">Mark all as read</button>
      </div>

      <div className="notifications-list">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification-card ${notif.type} ${!notif.read ? 'unread' : ''}`}>
            <div className="notification-card-content">
              <div className="notification-card-header">
                <h3>{notif.title}</h3>
                <span className="notification-time">{notif.time}</span>
              </div>
              <p className="notification-message">{notif.message}</p>
            </div>
            {!notif.read && <span className="unread-dot"></span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;