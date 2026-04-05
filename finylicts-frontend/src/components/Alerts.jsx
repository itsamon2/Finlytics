import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../service/api';
import Loader from './Loader';

const typeConfig = {
  CONTRIBUTION:    { icon: '🔔', className: 'info'    },
  BUDGET_EXCEEDED: { icon: '⚠️', className: 'warning' },
  GOAL_MILESTONE:  { icon: '🎯', className: 'success' },
};

const Alerts = () => {
  const navigate              = useNavigate();
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getLatest()
      .then(data => { setAlerts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage={false} message="Loading alerts..." />;

  if (alerts.length === 0) return (
    <div className="no-data" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      No alerts right now 🎉
    </div>
  );

  return (
    <div className="alerts-list">
      {alerts.map(alert => {
        const config = typeConfig[alert.type] || { icon: '📢', className: 'info' };
        return (
          <div
            key={alert.notificationId}
            className={`alert-item ${config.className} ${!alert.read ? 'unread' : ''}`}
            onClick={() => navigate('/notifications')}
            style={{ cursor: 'pointer' }}
          >
            <span className="alert-icon">{config.icon}</span>
            <div className="alert-content">
              <span className="alert-title">{alert.title}</span>
              <span className="alert-message">{alert.message}</span>
            </div>
            {!alert.read && <span className="unread-dot" />}
          </div>
        );
      })}
    </div>
  );
};

export default Alerts;