import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Goals.styles.css';
import { goalsService } from '../service/api';

const GoalsPage = () => {
  const navigate = useNavigate();

  const [goals, setGoals]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm]     = useState('');

  // ── Check-in state ─────────────────────────────────────────────────────────
  const [dueCheckIns, setDueCheckIns]         = useState([]);
  const [activeCheckIn, setActiveCheckIn]     = useState(null);  // the goal being answered
  const [checkInStep, setCheckInStep]         = useState(null);  // 'ask' | 'amount' | 'no-options' | 'reschedule' | 'frequency'
  const [checkInAmount, setCheckInAmount]     = useState('');
  const [rescheduleDate, setRescheduleDate]   = useState('');
  const [newFreqValue, setNewFreqValue]       = useState('');
  const [newFreqUnit, setNewFreqUnit]         = useState('DAYS');
  const [dismissedIds, setDismissedIds]       = useState([]); // dismissed for this session

  // ── Create form state ──────────────────────────────────────────────────────
  const [newGoal, setNewGoal] = useState({
    goalName:                  '',
    goalType:                  'SAVINGS',
    targetAmount:              '',
    savedAmount:               '',
    targetDate:                '',
    priority:                  'MEDIUM',
    status:                    'ACTIVE',
    contributionAmount:        '',
    contributionFrequencyValue: '',
    contributionFrequencyUnit: 'MONTHS',
  });

  const goalTypeEmoji = {
    SAVINGS: '🏦', INVESTMENT: '📈', DEBT: '💳',
    EMERGENCY: '🛡️', PURCHASE: '🛒', OTHER: '🎯',
  };

  const priorityColor = {
    HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#10B981',
  };

  const statusColor = {
    ACTIVE: '#3B82F6', PAUSED: '#6B7280', COMPLETED: '#10B981',
  };

  // ── Fetch goals ────────────────────────────────────────────────────────────
  const fetchGoals = () => {
    goalsService.getAll()
      .then(data => { setGoals(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  };

  // ── Fetch due check-ins ────────────────────────────────────────────────────
  const fetchDueCheckIns = () => {
    goalsService.getDueCheckIns()
      .then(data => setDueCheckIns(data))
      .catch(() => setDueCheckIns([]));
  };

  useEffect(() => {
    fetchGoals();
    fetchDueCheckIns();
    const goalsInterval   = setInterval(fetchGoals, 15000);
    const checkInInterval = setInterval(fetchDueCheckIns, 60000);
    return () => { clearInterval(goalsInterval); clearInterval(checkInInterval); };
  }, []);

  // ── Visible check-ins (not dismissed this session) ─────────────────────────
  const visibleCheckIns = dueCheckIns.filter(c => !dismissedIds.includes(c.goalId));

  // ── Check-in handlers ──────────────────────────────────────────────────────
  const openCheckIn = (checkIn) => {
    setActiveCheckIn(checkIn);
    setCheckInStep('ask');
    setCheckInAmount(checkIn.expectedAmount?.toString() || '');
    setRescheduleDate('');
    setNewFreqValue('');
    setNewFreqUnit('DAYS');
  };

  const closeCheckIn = () => {
    setActiveCheckIn(null);
    setCheckInStep(null);
  };

  const dismissCheckIn = (goalId) => {
    setDismissedIds(prev => [...prev, goalId]);
  };

  // User said YES — go to amount confirmation step
  const handleYes = () => setCheckInStep('amount');

  // User confirmed the amount (full or different)
  const handleConfirmAmount = () => {
    const amount = parseFloat(checkInAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    goalsService.confirmContribution(activeCheckIn.goalId, amount)
      .then(() => {
        fetchGoals();
        fetchDueCheckIns();
        closeCheckIn();
      })
      .catch(err => alert(`Failed to record contribution: ${err.message}`));
  };

  // User said NO — show two options
  const handleNo = () => setCheckInStep('no-options');

  // User chose "different amount" from the NO options
  const handleDifferentAmount = () => setCheckInStep('amount');

  // User chose "contribute later" from the NO options
  const handleContributeLater = () => setCheckInStep('reschedule');

  // User confirmed a reschedule date
  const handleConfirmReschedule = () => {
    if (!rescheduleDate) {
      alert('Please pick a date');
      return;
    }
    goalsService.rescheduleContribution(activeCheckIn.goalId, rescheduleDate)
      .then(() => {
        fetchDueCheckIns();
        closeCheckIn();
      })
      .catch(err => alert(`Failed to reschedule: ${err.message}`));
  };

  // User wants to change frequency after a reschedule
  const handleChangeFrequency = () => setCheckInStep('frequency');

  // User confirmed a new frequency
  const handleConfirmFrequency = () => {
    const val = parseInt(newFreqValue);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid frequency number');
      return;
    }
    goalsService.updateFrequency(activeCheckIn.goalId, val, newFreqUnit)
      .then(() => {
        fetchGoals();
        fetchDueCheckIns();
        closeCheckIn();
      })
      .catch(err => alert(`Failed to update frequency: ${err.message}`));
  };

  // ── Filtered goals ─────────────────────────────────────────────────────────
  const filteredGoals = goals.filter(g =>
    g.goalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.goalType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalSaved     = goals.reduce((s, g) => s + parseFloat(g.savedAmount  || 0), 0);
  const activeGoals    = goals.filter(g => g.status === 'ACTIVE').length;
  const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;

  // ── Create goal ────────────────────────────────────────────────────────────
  const handleCreateGoal = () => {
    if (!newGoal.goalName || !newGoal.targetAmount || !newGoal.targetDate) {
      alert('Please fill in goal name, target amount and target date');
      return;
    }
    if (!newGoal.contributionFrequencyValue || !newGoal.contributionFrequencyUnit) {
      alert('Please set a contribution frequency');
      return;
    }
    goalsService.create({
      ...newGoal,
      targetAmount:               parseFloat(newGoal.targetAmount),
      savedAmount:                parseFloat(newGoal.savedAmount || 0),
      contributionAmount:         parseFloat(newGoal.contributionAmount || 0),
      contributionFrequencyValue: parseInt(newGoal.contributionFrequencyValue),
    })
      .then(() => {
        fetchGoals();
        fetchDueCheckIns();
        setShowCreateModal(false);
        setNewGoal({
          goalName: '', goalType: 'SAVINGS', targetAmount: '', savedAmount: '',
          targetDate: '', priority: 'MEDIUM', status: 'ACTIVE',
          contributionAmount: '', contributionFrequencyValue: '', contributionFrequencyUnit: 'MONTHS',
        });
      })
      .catch(err => alert(`Failed to create goal: ${err.message}`));
  };

  // ── Delete goal ────────────────────────────────────────────────────────────
  const handleDeleteGoal = () => {
    goalsService.delete(showDeleteConfirm)
      .then(() => {
        fetchGoals();
        setShowDeleteConfirm(null);
      })
      .catch(err => alert(`Failed to delete goal: ${err.message}`));
  };

  // ── Progress helpers ───────────────────────────────────────────────────────
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

      {/* ── Check-in Banners ── */}
      {visibleCheckIns.length > 0 && (
        <div className="checkin-banners">
          {visibleCheckIns.map(checkIn => (
            <div key={checkIn.goalId} className="checkin-banner">
              <div className="checkin-banner-left">
                <span className="checkin-bell">🔔</span>
                <div>
                  <strong>{checkIn.goalName}</strong>
                  <p>
                    Contribution due — Ksh {parseFloat(checkIn.expectedAmount || 0).toLocaleString()}
                    &nbsp;·&nbsp;{Math.round(checkIn.progressPercent)}% saved so far
                  </p>
                </div>
              </div>
              <div className="checkin-banner-actions">
                <button className="btn btn-primary btn-sm" onClick={() => openCheckIn(checkIn)}>
                  Check In
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => dismissCheckIn(checkIn.goalId)}>
                  Later
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
          const progress   = getProgress(goal);
          const monthsLeft = getMonthsLeft(goal.targetDate);
          const remaining  = parseFloat(goal.targetAmount) - parseFloat(goal.savedAmount || 0);
          const accentColor = priorityColor[goal.priority] || '#3B82F6';
          const isDue = visibleCheckIns.some(c => c.goalId === goal.goalId);

          return (
            <div key={goal.goalId} className={`budget-card good ${isDue ? 'checkin-due' : ''}`}>

              {isDue && (
                <div className="due-indicator">🔔 Contribution Due</div>
              )}

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
                <button className="menu-btn" onClick={() => setShowDeleteConfirm(goal.goalId)}>🗑️</button>
              </div>

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
                {goal.contributionFrequencyValue && goal.contributionFrequencyUnit && (
                  <div className="amount-row">
                    <span>Frequency</span>
                    <strong>Every {goal.contributionFrequencyValue} {goal.contributionFrequencyUnit.toLowerCase()}</strong>
                  </div>
                )}
              </div>

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

              <div className="goal-meta">
                <span className="goal-badge"
                  style={{ backgroundColor: `${priorityColor[goal.priority]}20`, color: priorityColor[goal.priority] }}>
                  {goal.priority}
                </span>
                <span className="goal-badge"
                  style={{ backgroundColor: `${statusColor[goal.status]}20`, color: statusColor[goal.status] }}>
                  {goal.status}
                </span>
                <span className="goal-months">{monthsLeft} months left</span>
              </div>

              <div className="card-actions">
                <button className="action-btn" onClick={() => navigate(`/goals/${goal.goalId}/feasibility`)}>
                  📊 Feasibility
                </button>
                <button className="action-btn" onClick={() => navigate(`/goals/${goal.goalId}/advisory`)}>
                  💡 Advisory
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Check-in Modal ── */}
      {activeCheckIn && (
        <div className="modal-overlay" onClick={closeCheckIn}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>

            {/* ask — "Did you contribute?" */}
            {checkInStep === 'ask' && (
              <>
                <div className="modal-header">
                  <h2>🔔 Contribution Check-in</h2>
                  <button className="close-btn" onClick={closeCheckIn}>×</button>
                </div>
                <div className="modal-body">
                  <p>
                    Did you contribute towards <strong>{activeCheckIn.goalName}</strong>?
                  </p>
                  <p className="checkin-expected">
                    Expected: <strong>Ksh {parseFloat(activeCheckIn.expectedAmount || 0).toLocaleString()}</strong>
                  </p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleNo}>No</button>
                  <button className="btn btn-primary" onClick={handleYes}>Yes</button>
                </div>
              </>
            )}

            {/* amount — enter actual amount contributed */}
            {checkInStep === 'amount' && (
              <>
                <div className="modal-header">
                  <h2>💰 Amount Contributed</h2>
                  <button className="close-btn" onClick={closeCheckIn}>×</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>How much did you contribute? (Ksh)</label>
                    <input
                      type="number"
                      value={checkInAmount}
                      onChange={e => setCheckInAmount(e.target.value)}
                      placeholder="Enter amount"
                      autoFocus
                    />
                  </div>
                  <p className="checkin-hint">
                    Expected was Ksh {parseFloat(activeCheckIn.expectedAmount || 0).toLocaleString()} — enter the actual amount even if different.
                  </p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setCheckInStep('ask')}>Back</button>
                  <button className="btn btn-primary" onClick={handleConfirmAmount}>Confirm</button>
                </div>
              </>
            )}

            {/* no-options — user said no */}
            {checkInStep === 'no-options' && (
              <>
                <div className="modal-header">
                  <h2>No Problem — What Would You Like to Do?</h2>
                  <button className="close-btn" onClick={closeCheckIn}>×</button>
                </div>
                <div className="modal-body checkin-options">
                  <button className="checkin-option-btn" onClick={handleDifferentAmount}>
                    <span>💵</span>
                    <div>
                      <strong>I contributed a different amount</strong>
                      <p>Record what you actually contributed</p>
                    </div>
                  </button>
                  <button className="checkin-option-btn" onClick={handleContributeLater}>
                    <span>📅</span>
                    <div>
                      <strong>I'll contribute on a different date</strong>
                      <p>Set a new date and we'll remind you then</p>
                    </div>
                  </button>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setCheckInStep('ask')}>Back</button>
                </div>
              </>
            )}

            {/* reschedule — pick a new date */}
            {checkInStep === 'reschedule' && (
              <>
                <div className="modal-header">
                  <h2>📅 Pick a New Date</h2>
                  <button className="close-btn" onClick={closeCheckIn}>×</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>When will you contribute?</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={e => setRescheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      autoFocus
                    />
                  </div>
                  <p className="checkin-hint">
                    We'll remind you on this date. After you contribute, you can also update your frequency if needed.
                  </p>
                  <button className="checkin-option-btn" onClick={handleChangeFrequency} style={{ marginTop: '12px' }}>
                    <span>🔄</span>
                    <div>
                      <strong>Change my contribution frequency instead</strong>
                      <p>Update how often you contribute going forward</p>
                    </div>
                  </button>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setCheckInStep('no-options')}>Back</button>
                  <button className="btn btn-primary" onClick={handleConfirmReschedule}>Save Date</button>
                </div>
              </>
            )}

            {/* frequency — change contribution period */}
            {checkInStep === 'frequency' && (
              <>
                <div className="modal-header">
                  <h2>🔄 Update Contribution Frequency</h2>
                  <button className="close-btn" onClick={closeCheckIn}>×</button>
                </div>
                <div className="modal-body">
                  <p>How often would you like to contribute going forward?</p>
                  <div className="form-row" style={{ marginTop: '16px' }}>
                    <div className="form-group half">
                      <label>Every</label>
                      <input
                        type="number"
                        min="1"
                        value={newFreqValue}
                        onChange={e => setNewFreqValue(e.target.value)}
                        placeholder="e.g. 2"
                        autoFocus
                      />
                    </div>
                    <div className="form-group half">
                      <label>Unit</label>
                      <select value={newFreqUnit} onChange={e => setNewFreqUnit(e.target.value)}>
                        <option value="DAYS">Days</option>
                        <option value="WEEKS">Weeks</option>
                        <option value="MONTHS">Months</option>
                        <option value="YEARS">Years</option>
                      </select>
                    </div>
                  </div>
                  <p className="checkin-hint">
                    Your next contribution date will be calculated from today using this new frequency.
                  </p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setCheckInStep('reschedule')}>Back</button>
                  <button className="btn btn-primary" onClick={handleConfirmFrequency}>Update Frequency</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

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
                  <label>Contribution Amount (Ksh)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newGoal.contributionAmount}
                    onChange={e => setNewGoal({ ...newGoal, contributionAmount: e.target.value })}
                  />
                </div>
              </div>

              {/* Contribution frequency — replaces nextContributionDate */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Contribute Every</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={newGoal.contributionFrequencyValue}
                    onChange={e => setNewGoal({ ...newGoal, contributionFrequencyValue: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Unit</label>
                  <select
                    value={newGoal.contributionFrequencyUnit}
                    onChange={e => setNewGoal({ ...newGoal, contributionFrequencyUnit: e.target.value })}
                  >
                    <option value="DAYS">Days</option>
                    <option value="WEEKS">Weeks</option>
                    <option value="MONTHS">Months</option>
                    <option value="YEARS">Years</option>
                  </select>
                </div>
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