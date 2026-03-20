import React from 'react';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
  const navigate = useNavigate();
  
  const alerts = [
    { type: "warning", title: "Overspending Alert", message: "Food budget exceeded by $120 this month", icon: "⚠️" },
    { type: "success", title: "Goal Milestone", message: "Emergency fund is 57% complete!", icon: "🎯" },
    { type: "info", title: "Bill Reminder", message: "Rent payment due in 3 days", icon: "📅" }
  ];

  return (
    <div className="alerts-list">
      {alerts.map((alert, index) => (
        <div 
          key={index} 
          className={`alert-item ${alert.type}`}
          onClick={() => navigate('/notifications')}
          style={{ cursor: 'pointer' }}
        >
          <span className="alert-icon">{alert.icon}</span>
          <div className="alert-content">
            <span className="alert-title">{alert.title}</span>
            <span className="alert-message">{alert.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Alerts;