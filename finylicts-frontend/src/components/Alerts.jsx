import React from 'react';

const Alerts = () => {
  const alerts = [
    { type: "warning", title: "Overspending Alert", message: "Food budget exceeded by $120 this month" },
    { type: "success", title: "Goal Milestone", message: "Emergency fund is 57% complete!" },
    { type: "info", title: "Bill Reminder", message: "Rent payment due in 3 days" }
  ];

  return (
    <div className="alerts-container">
      {alerts.map((alert, index) => (
        <div key={index} className={`alert-item alert-${alert.type}`}>
          <div className="alert-icon">
            {alert.type === 'warning' && '⚠️'}
            {alert.type === 'success' && '🎯'}
            {alert.type === 'info' && '📅'}
          </div>
          <div className="alert-content">
            <div className="alert-title">{alert.title}</div>
            <div className="alert-message">{alert.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Alerts;