import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsService } from '../service/api';
import Loader from './Loader';

const goalTypeEmoji = {
  SAVINGS:    '🏦',
  INVESTMENT: '📈',
  DEBT:       '💳',
  EMERGENCY:  '🛡️',
  PURCHASE:   '🛒',
  OTHER:      '🎯',
};

const priorityColor = {
  HIGH:   '#EF4444',
  MEDIUM: '#F59E0B',
  LOW:    '#10B981',
};

const Goals = () => {
  const navigate              = useNavigate();
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    goalsService.getAll()
      .then(data => {
        const active = data.filter(g => g.status === 'ACTIVE').slice(0, 3);
        setGoals(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage={false} message="Loading goals..." />;

  if (goals.length === 0) return (
    <div className="no-data" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
      No active goals yet.{' '}
      <span style={{ color: 'var(--accent-color)', cursor: 'pointer' }}
        onClick={() => navigate('/goals')}>
        Create one →
      </span>
    </div>
  );

  return (
    <div className="goals-grid">
      {goals.map((goal) => {
        const target     = parseFloat(goal.targetAmount || 0);
        const saved      = parseFloat(goal.savedAmount  || 0);
        const percentage = target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
        const color      = priorityColor[goal.priority] || '#3B82F6';

        return (
          <div key={goal.goalId} className="goal-item"
            onClick={() => navigate('/goals')} style={{ cursor: 'pointer' }}>
            <div className="goal-header">
              <div className="goal-icon" style={{ backgroundColor: `${color}15`, color }}>
                {goalTypeEmoji[goal.goalType] || '🎯'}
              </div>
              <span className="goal-name">{goal.goalName}</span>
            </div>

            <div className="goal-progress">
              <div className="progress-header">
                <span>Progress</span>
                <span className="progress-percentage" style={{ color }}>{percentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"
                  style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${color}, ${color}dd)` }} />
              </div>
            </div>

            <div className="goal-footer">
              <span className="goal-current">Ksh {saved.toLocaleString()}</span>
              <span className="goal-target">of Ksh {target.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Goals;