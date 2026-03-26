import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Goals.styles.css';
import { goalsService } from '../service/api';

const GoalsPage = () => {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newGoal, setNewGoal] = useState({
    goalName: '',
    goalType: 'SAVINGS',
    targetAmount: '',
    savedAmount: '',
    targetDate: '',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    contributionAmount: '',
    nextContributionDate: '',
  });

  const goalTypeEmoji = {
    SAVINGS: '🏦',
    INVESTMENT: '📈',
    DEBT: '💳',
    EMERGENCY: '🛡️',
    PURCHASE: '🛒',
    OTHER: '🎯',
  };

  const priorityColor = {
    HIGH: '#EF4444',
    MEDIUM: '#F59E0B',
    LOW: '#10B981',
  };

  const statusColor = {
    ACTIVE: '#3B82F6',
    PAUSED: '#6B7280',
    COMPLETED: '#10B981',
  };

  // ─── Fetch goals ───────────────────────────────────────────────────────────
  const fetchGoals = () => {
    goalsService.getAll()
      .then(data => { setGoals(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    fetchGoals();
    const interval = setInterval(fetchGoals, 15000);
    return () => clearInterval(interval);
  }, []);

  // ─── Filtered goals ────────────────────────────────────────────────────────
  const filteredGoals = goals.filter(g =>
    g.goalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.goalType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Totals ────────────────────────────────────────────────────────────────
  const totalTarget = goals.reduce((s, g) => s + parseFloat(g.targetAmount || 0), 0);
  const totalSaved  = goals.reduce((s, g) => s + parseFloat(g.savedAmount  || 0), 0);
  const activeGoals = goals.filter(g => g.status === 'ACTIVE').length;
  const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;

  // ─── Create goal ───────────────────────────────────────────────────────────
  const handleCreateGoal = () => {
    if (!newGoal.goalName || !newGoal.targetAmount || !newGoal.targetDate) {
      alert('Please fill in goal name, target amount and target date');
      return;
    }
    goalsService.create({
      ...newGoal,
      targetAmount:       parseFloat(newGoal.targetAmount),
      savedAmount:        parseFloat(newGoal.savedAmount || 0),
      contributionAmount: parseFloat(newGoal.contributionAmount || 0),
    })
      .then(() => {
        fetchGoals();
        setShowCreateModal(false);
        setNewGoal({
          goalName: '', goalType: 'SAVINGS', targetAmount: '', savedAmount: '',
          targetDate: '', priority: 'MEDIUM', status: 'ACTIVE',
          contributionAmount: '', nextContributionDate: '',
        });
      })
      .catch(err => alert(`Failed to create goal: ${err.message}`));
  };

  // ─── Delete goal ───────────────────────────────────────────────────────────
  const handleDeleteGoal = () => {
    // Goals controller doesn't have a DELETE endpoint yet — see note at bottom
    alert('Delete not yet supported. Add a DELETE endpoint to GoalsController.');
    setShowDeleteConfirm(null);
  };

  // ─── Progress helpers ──────────────────────────────────────────────────────
  const getProgress = (goal) => {
    const target = parseFloat(goal.targetAmount);
    const saved  = parseFloat(goal.savedAmount || 0);
    return target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  };

  const getMonthsLeft = (targetDate) => {
    const today = new Date();
    const end   = new Date(targetDate);
    const diff  = (end.getFullYear() - today.getFullYear()) * 12 + (end.getMonth() - today.getMonth());
    return Math.max(diff, 0);
  };

  if (loading) return <div className="loading">Loading goals...</div>;
  if (error)   return <div className="error">Error: {error}</div>;

  return (
    <div className="goals-page">

      {/* ── Header ── */}
      <div className="goals-header">
        <div>
          <h1>My Goals</h1>
          <p className="header-subtitle">Set targets, track progress, achieve more</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <span>+</span> New Goal
          </button>
        </div>
      </div>

      {/* ── Overview Cards ── */}
      <div className="overview-cards">
        <div className="overview-card total">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <span className="card-label">Total Goals</span>
            <span className="card-value">{goals.length}</span>
          </div>
        </div>
        <div className="overview-card spent">
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <span className="card-label">Active</span>
            <span className="card-value">{activeGoals}</span>
          </div>
        </div>
        <div className="overview-card remaining">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">Total Saved</span>
            <span className="card-value">Ksh {totalSaved.toLocaleString()}</span>
          </div>
        </div>
        <div className="overview-card savings">
          <div className="card-icon">🏆</div>
          <div className="card-content">
            <span className="card-label">Completed</span>
            <span className="card-value">{completedGoals}</span>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="goals-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search goals..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* ── Empty state ── */}
      {filteredGoals.length === 0 && (
        <div className="no-budgets">
          <p>No goals yet. Create one to start tracking! 🎯</p>
        </div>
      )}

      {/* ── Goals Grid ── */}
      <div className="budget-grid">
        {filteredGoals.map(goal => {
          const progress    = getProgress(goal);
          const monthsLeft  = getMonthsLeft(goal.targetDate);
          const remaining   = parseFloat(goal.targetAmount) - parseFloat(goal.savedAmount || 0);
          const accentColor = priorityColor[goal.priority] || '#3B82F6';

          return (
            <div key={goal.goalId} className="budget-card good">

              {/* Card header */}
              <div className="card-header">
                <div className="category-info">
                  <div className="category-icon" style={{ backgroundColor: `${accentColor}15` }}>
                    <span style={{ color: accentColor }}>
                      {goalTypeEmoji[goal.goalType] || '🎯'}
                    </span>
                  </div>
                  <div>
                    <h3>{goal.goalName}</h3>
                    <span className="budget-trend">{goal.goalType}</span>
                  </div>
                </div>
                <button
                  className="menu-btn"
                  title="Delete goal"
                  onClick={() => setShowDeleteConfirm(goal.goalId)}
                >
                  🗑️
                </button>
              </div>

              {/* Amounts */}
              <div className="budget-details">
                <div className="amount-row">
                  <span>Target</span>
                  <strong>Ksh {parseFloat(goal.targetAmount).toLocaleString()}</strong>
                </div>
                <div className="amount-row">
                  <span>Saved</span>
                  <strong>Ksh {parseFloat(goal.savedAmount || 0).toLocaleString()}</strong>
                </div>
                <div className="amount-row">
                  <span>Remaining</span>
                  <strong className={remaining > 0 ? 'positive' : 'negative'}>
                    Ksh {remaining.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Progress bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <span style={{ color: accentColor }}>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%`, backgroundColor: accentColor }}
                  />
                </div>
              </div>

              {/* Meta row */}
              <div className="goal-meta">
                <span
                  className="goal-badge"
                  style={{ backgroundColor: `${priorityColor[goal.priority]}20`, color: priorityColor[goal.priority] }}
                >
                  {goal.priority}
                </span>
                <span
                  className="goal-badge"
                  style={{ backgroundColor: `${statusColor[goal.status]}20`, color: statusColor[goal.status] }}
                >
                  {goal.status}
                </span>
                <span className="goal-months">{monthsLeft} months left</span>
              </div>

              {/* Actions */}
              <div className="card-actions">
                <button
                  className="action-btn"
                  onClick={() => navigate(`/goals/${goal.goalId}/feasibility`)}
                >
                  📊 Feasibility
                </button>
                <button
                  className="action-btn"
                  onClick={() => navigate(`/goals/${goal.goalId}/advisory`)}
                >
                  💡 Advisory
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Create Goal Modal ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Goal</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Buy a Car, Emergency Fund"
                  value={newGoal.goalName}
                  onChange={e => setNewGoal({ ...newGoal, goalName: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Goal Type</label>
                  <select value={newGoal.goalType} onChange={e => setNewGoal({ ...newGoal, goalType: e.target.value })}>
                    <option value="SAVINGS">Savings</option>
                    <option value="INVESTMENT">Investment</option>
                    <option value="DEBT">Debt</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="PURCHASE">Purchase</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Priority</label>
                  <select value={newGoal.priority} onChange={e => setNewGoal({ ...newGoal, priority: e.target.value })}>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Target Amount (Ksh)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newGoal.targetAmount}
                    onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Already Saved (Ksh)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newGoal.savedAmount}
                    onChange={e => setNewGoal({ ...newGoal, savedAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Monthly Contribution (Ksh)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newGoal.contributionAmount}
                    onChange={e => setNewGoal({ ...newGoal, contributionAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Next Contribution Date</label>
                <input
                  type="date"
                  value={newGoal.nextContributionDate}
                  onChange={e => setNewGoal({ ...newGoal, nextContributionDate: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateGoal}>Create Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Goal</h2>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this goal? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteGoal}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoalsPage;