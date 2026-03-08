import React from 'react';

const Goals = () => {
  const goals = [
    { name: "Emergency Fund", current: 8500, target: 15000 },
    { name: "Vacation", current: 2200, target: 5000 },
    { name: "New Car", current: 6800, target: 25000 }
  ];

  return (
    <div className="goals-container">
      {goals.map((goal, index) => {
        const percentage = (goal.current / goal.target) * 100;
        return (
          <div key={index} className="goal-item">
            <div className="goal-header">
              <span className="goal-name">{goal.name}</span>
              <span className="goal-numbers">${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</span>
            </div>
            <div className="goal-progress-bar">
              <div 
                className="goal-progress-fill" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="goal-percentage">{Math.round(percentage)}%</span>
          </div>
        );
      })}
    </div>
  );
};

export default Goals;