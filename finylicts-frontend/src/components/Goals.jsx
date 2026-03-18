import React from 'react';

const Goals = () => {
  const goals = [
    { 
      name: "Emergency Fund", 
      current: 8500, 
      target: 15000, 
      color: '#2DD4BF',
      icon: '🛡️',
      progress: 57
    },
    { 
      name: "Vacation", 
      current: 2200, 
      target: 5000, 
      color: '#F59E0B',
      icon: '✈️',
      progress: 44
    },
    { 
      name: "New Car", 
      current: 6800, 
      target: 25000, 
      color: '#3B82F6',
      icon: '🚗',
      progress: 27
    }
  ];

  return (
    <div className="dashboard-goals">
      {goals.map((goal, index) => (
        <div key={index} className="dashboard-goal-item">
          <div className="goal-header">
            <div className="goal-title">
              <span className="goal-icon" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
                {goal.icon}
              </span>
              <span className="goal-name">{goal.name}</span>
            </div>
            <span className="goal-percentage">{goal.progress}%</span>
          </div>
          
          <div className="goal-progress-container">
            <div className="goal-progress-bar">
              <div 
                className="goal-progress-fill" 
                style={{ 
                  width: `${goal.progress}%`,
                  backgroundColor: goal.color
                }}
              ></div>
            </div>
          </div>
          
          <div className="goal-footer">
            <span className="goal-current">${goal.current.toLocaleString()}</span>
            <span className="goal-target">of ${goal.target.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Goals;