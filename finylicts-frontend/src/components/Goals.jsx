import React from 'react';
import { useNavigate } from 'react-router-dom';

const Goals = () => {
  const navigate = useNavigate();
  
  const goals = [
    { 
      name: "Emergency Fund", 
      current: 8500, 
      target: 15000, 
      color: '#2DD4BF',
      icon: '🛡️'
    },
    { 
      name: "Vacation", 
      current: 2200, 
      target: 5000, 
      color: '#F59E0B',
      icon: '✈️'
    },
    { 
      name: "New Car", 
      current: 6800, 
      target: 25000, 
      color: '#3B82F6',
      icon: '🚗'
    }
  ];

  return (
    <div className="goals-grid">
      {goals.map((goal, index) => {
        const percentage = Math.round((goal.current / goal.target) * 100);
        
        return (
          <div 
            key={index} 
            className="goal-item"
            onClick={() => navigate('/goals')}
            style={{ cursor: 'pointer' }}
          >
            <div className="goal-header">
              <div className="goal-icon" style={{ backgroundColor: `${goal.color}15`, color: goal.color }}>
                {goal.icon}
              </div>
              <span className="goal-name">{goal.name}</span>
            </div>
            
            <div className="goal-progress">
              <div className="progress-header">
                <span>Progress</span>
                <span className="progress-percentage">{percentage}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${goal.color}, ${goal.color}dd)`
                  }}
                ></div>
              </div>
            </div>
            
            <div className="goal-footer">
              <span className="goal-current">${goal.current.toLocaleString()}</span>
              <span className="goal-target">of ${goal.target.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Goals;