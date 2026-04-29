import React, { useState, useEffect, useMemo } from 'react';
import './Budgets.styles.css';
import { budgetService, transactionService } from '../service/api';
import Loader from '../components/Loader';

const BudgetsPage = () => {
  const [viewMode, setViewMode]                     = useState('grid');
  const [showCreateModal, setShowCreateModal]       = useState(false);
  const [showDetailsModal, setShowDetailsModal]     = useState(false);
  const [selectedBudget, setSelectedBudget]         = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm]   = useState(null);
  const [showAdjustModal, setShowAdjustModal]       = useState(false);
  const [adjustBudget, setAdjustBudget]             = useState(null);
  const [adjustAmount, setAdjustAmount]             = useState('');

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear]   = useState(now.getFullYear());
  const isCurrentMonth = currentMonth === now.getMonth() + 1 &&
                         currentYear  === now.getFullYear();

  const [budgets, setBudgets]                           = useState([]);
  const [isHistorical, setIsHistorical]                 = useState(false);
  const [categoryTransactions, setCategoryTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions]   = useState(false);
  const [loading, setLoading]                           = useState(true);
  const [error, setError]                               = useState(null);

  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [rolloverLoading, setRolloverLoading]     = useState(false);

  const [newBudget, setNewBudget] = useState({
    category: '', budget: '', color: '#2DD4BF', icon: '💰',
  });

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const colorOptions = [
    '#2DD4BF','#F59E0B','#3B82F6','#8B5CF6',
    '#EC4899','#EF4444','#10B981','#F97316',
  ];

  const iconOptions = ['🏠','🍔','🚗','🎬','💡','🛍️','💰','📚','🏥','✈️'];

  const getCategoryIcon = (category = '') => {
    const map = {
      FOOD:'🍔',GROCERIES:'🛒',TRANSPORT:'🚗',TRAVEL:'✈️',
      HOUSING:'🏠',RENT:'🏠',ENTERTAINMENT:'🎬',UTILITIES:'💡',
      SHOPPING:'🛍️',HEALTH:'🏥',EDUCATION:'📚',SALARY:'💼',
      SAVINGS:'🏦',INVESTMENT:'📈',
    };
    const key = Object.keys(map).find(k => category.toUpperCase().includes(k));
    return key ? map[key] : '💰';
  };

  const fetchBudgets = (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    budgetService.getByMonth(currentMonth, currentYear)
      .then(data => {
        setIsHistorical(!data.isCurrentMonth);
        const normalized = data.budgets.map(b => ({
          id:           b.budgetId || b.historyId,
          category:     b.category,
          budget:       parseFloat(b.budgetLimit),
          spent:        parseFloat(b.amountSpent),
          color:        b.color || '#2DD4BF',
          icon:         getCategoryIcon(b.category),
          budgetPeriod: b.budgetPeriod || 'MONTHLY',
          isHistory:    !data.isCurrentMonth,
          creationDate: b.creationDate || null,
        }));
        setBudgets(normalized);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    budgetService.checkRollover()
      .then(data => { if (data.rolloverNeeded) setShowRolloverModal(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBudgets(true);
    if (isCurrentMonth) {
      const interval = setInterval(() => fetchBudgets(false), 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentMonth, currentYear]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent  = budgets.reduce((sum, b) => sum + b.spent,  0);
  const remaining   = totalBudget - totalSpent;
  const savingsRate = totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0;

  const changeMonth = (direction) => {
    let m = currentMonth + direction;
    let y = currentYear;
    if (m < 1)  { m = 12; y -= 1; }
    if (m > 12) { m = 1;  y += 1; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const selectedMonthLabel = `${months[currentMonth - 1]} ${currentYear}`;

  const handleRollover = (continueWithSame) => {
    setRolloverLoading(true);
    budgetService.rollover(continueWithSame)
      .then(() => { setShowRolloverModal(false); setRolloverLoading(false); fetchBudgets(false); })
      .catch(err => { alert(`Rollover failed: ${err.message}`); setRolloverLoading(false); });
  };

  const handleExport = () => {
    const csvContent = [
      ['Category','Budget','Spent','Remaining','Spent %'],
      ...budgets.map(b => [
        b.category, b.budget, b.spent,
        b.budget - b.spent,
        Math.round((b.spent / b.budget) * 100) + '%',
      ]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `budgets-${selectedMonthLabel.replace(' ', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateBudget = () => {
    if (!newBudget.category || !newBudget.budget) { alert('Please fill in all fields'); return; }
    budgetService.create({
      category: newBudget.category.toUpperCase(),
      budgetLimit: parseFloat(newBudget.budget),
      color: newBudget.color,
      budgetPeriod: 'MONTHLY',
    })
      .then(() => {
        fetchBudgets(false);
        setShowCreateModal(false);
        setNewBudget({ category: '', budget: '', color: '#2DD4BF', icon: '💰' });
      })
      .catch(err => alert(`Failed to create budget: ${err.message}`));
  };

  const handleViewDetails = (budget) => {
    setSelectedBudget(budget);
    setCategoryTransactions([]);
    setLoadingTransactions(true);
    setShowDetailsModal(true);
    const fetchPromise = budget.isHistory
      ? transactionService.getByMonth(currentMonth, currentYear)
          .then(txns => txns.filter(t => t.category?.toUpperCase() === budget.category.toUpperCase()))
      : transactionService.getByCategory(budget.category);
    fetchPromise
      .then(data => setCategoryTransactions(data.sort((a, b) => b.transactionId - a.transactionId).slice(0, 5)))
      .catch(() => setCategoryTransactions([]))
      .finally(() => setLoadingTransactions(false));
  };

  const handleAdjustClick = (budget) => {
    setAdjustBudget(budget);
    setAdjustAmount(budget.budget.toString());
    setShowAdjustModal(true);
  };

  const handleAdjustBudget = () => {
    const newAmount = parseFloat(adjustAmount);
    if (isNaN(newAmount) || newAmount <= 0) { alert('Please enter a valid amount'); return; }
    budgetService.update(adjustBudget.id, {
      category: adjustBudget.category, budgetLimit: newAmount,
      color: adjustBudget.color, budgetPeriod: adjustBudget.budgetPeriod,
    })
      .then(() => { fetchBudgets(false); setShowAdjustModal(false); setAdjustBudget(null); })
      .catch(err => alert(`Failed to adjust budget: ${err.message}`));
  };

  const handleDeleteClick  = (id) => setShowDeleteConfirm(id);
  const handleDeleteBudget = () => {
    budgetService.delete(showDeleteConfirm)
      .then(() => {
        fetchBudgets(false);
        setShowDeleteConfirm(null);
        if (showDetailsModal) setShowDetailsModal(false);
      })
      .catch(err => alert(`Failed to delete budget: ${err.message}`));
  };

  if (loading) return <Loader fullPage={false} message="Loading budgets..." />;
  if (error)   return <div className="error">Error: {error}</div>;

  return (
    <div className="budgets-page">

      <div className="budgets-header">
        <div>
          <h1>Budget Planner</h1>
          <p className="header-subtitle">
            {isHistorical ? `Viewing history for ${selectedMonthLabel}` : 'Track and manage your monthly spending'}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExport}><span>📊</span> Export</button>
          <button className="btn btn-secondary" onClick={() => fetchBudgets(false)}>🔄 Refresh</button>
          {isCurrentMonth && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><span>+</span> Create Budget</button>
          )}
        </div>
      </div>

      {isHistorical && (
        <div className="historical-banner">
          📅 You are viewing <strong>{selectedMonthLabel}</strong> — this is read-only history.
          <button className="btn btn-secondary btn-sm"
            onClick={() => { setCurrentMonth(now.getMonth() + 1); setCurrentYear(now.getFullYear()); }}>
            Back to Current Month
          </button>
        </div>
      )}

      <div className="overview-cards">
        <div className="overview-card total">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">Total Budget</span>
            <span className="card-value">Ksh {totalBudget.toLocaleString()}</span>
          </div>
        </div>
        <div className="overview-card spent">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <span className="card-label">Total Spent</span>
            <span className="card-value">Ksh {totalSpent.toLocaleString()}</span>
          </div>
        </div>
        <div className="overview-card remaining">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <span className="card-label">Remaining</span>
            <span className="card-value">Ksh {remaining.toLocaleString()}</span>
          </div>
        </div>
        <div className="overview-card savings">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <span className="card-label">Savings Rate</span>
            <span className="card-value">{savingsRate}%</span>
          </div>
        </div>
      </div>

      <div className="health-card">
        <div className="health-header">
          <h3>Budget Health</h3>
          <span className="health-score">{savingsRate}%</span>
        </div>
        <div className="health-bar">
          <div className="health-progress" style={{ width: `${100 - savingsRate}%` }} />
        </div>
        <p className="health-note">
          {savingsRate > 0
            ? `You saved ${savingsRate}% of your total budget${isHistorical ? ` in ${selectedMonthLabel}` : ''}.`
            : `Full budget used${isHistorical ? ` in ${selectedMonthLabel}` : ' this month'}.`}
        </p>
      </div>

      <div className="controls-bar">
        <div className="month-selector">
          <button className="month-nav" onClick={() => changeMonth(-1)}>←</button>
          <span className="current-month">{selectedMonthLabel}</span>
          <button className="month-nav" onClick={() => changeMonth(1)}
            disabled={isCurrentMonth} style={{ opacity: isCurrentMonth ? 0.4 : 1 }}>→</button>
        </div>
        <div className="view-toggle">
          <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><span>⊞</span> Grid</button>
          <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><span>☰</span> List</button>
        </div>
      </div>

      {budgets.length === 0 && (
        <div className="no-budgets">
          <p>{isHistorical ? `No budget data found for ${selectedMonthLabel}.` : 'No budgets yet. Create one to start tracking!'}</p>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="budget-grid">
          {budgets.map((budget) => {
            const percentage = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0;
            const status = percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : 'good';
            return (
              <div key={budget.id} className={`budget-card ${status}`}>
                <div className="card-header">
                  <div className="category-info">
                    <div className="category-icon" style={{ backgroundColor: `${budget.color}15` }}>
                      <span style={{ color: budget.color }}>{budget.icon}</span>
                    </div>
                    <div>
                      <h3>{budget.category}</h3>
                      <span className="budget-trend">{budget.budgetPeriod}</span>
                    </div>
                  </div>
                  {!isHistorical && (
                    <button className="menu-btn" onClick={() => handleDeleteClick(budget.id)}>🗑️</button>
                  )}
                </div>
                <div className="budget-details">
                  <div className="amount-row"><span>Budget</span><strong>Ksh {budget.budget.toLocaleString()}</strong></div>
                  <div className="amount-row"><span>Spent</span><strong>Ksh {budget.spent.toLocaleString()}</strong></div>
                  <div className="amount-row">
                    <span>Remaining</span>
                    <strong className={budget.budget - budget.spent > 0 ? 'positive' : 'negative'}>
                      Ksh {(budget.budget - budget.spent).toLocaleString()}
                    </strong>
                  </div>
                  <div className="amount-row"><span>Created</span><strong>{budget.creationDate || 'N/A'}</strong></div>
                </div>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span style={{ color: budget.color }}>{Math.round(percentage)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: budget.budget - budget.spent < 0 ? '#EF4444' : budget.color,
                    }} />
                  </div>
                </div>
                <div className="card-actions">
                  <button className="action-btn" onClick={() => handleViewDetails(budget)}>View Details</button>
                  {!isHistorical && (
                    <button className="action-btn" onClick={() => handleAdjustClick(budget)}>Adjust</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="budget-list">
          <div className="list-header">
            <span>Category</span><span>Budget</span><span>Spent</span>
            <span>Remaining</span><span>Progress</span><span></span>
          </div>
          {budgets.map((budget) => {
            const percentage = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0;
            return (
              <div key={budget.id} className="list-row">
                <div className="category-cell">
                  <span className="list-icon" style={{ backgroundColor: `${budget.color}15`, color: budget.color }}>{budget.icon}</span>
                  <span>{budget.category}</span>
                </div>
                <div>Ksh {budget.budget.toLocaleString()}</div>
                <div>Ksh {budget.spent.toLocaleString()}</div>
                <div className={budget.budget - budget.spent > 0 ? 'positive' : 'negative'}>
                  Ksh {(budget.budget - budget.spent).toLocaleString()}
                </div>
                <div className="progress-cell">
                  <div className="list-progress">
                    <div className="list-progress-bar">
                      <div className="list-progress-fill" style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: budget.budget - budget.spent < 0 ? '#EF4444' : budget.color,
                      }} />
                    </div>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                </div>
                <div>
                  {!isHistorical && (
                    <button className="list-menu" onClick={() => handleDeleteClick(budget.id)}>🗑️</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rollover Modal */}
      {showRolloverModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>🗓️ New Month Started!</h2></div>
            <div className="modal-body">
              <p>It's a new month — <strong>{months[now.getMonth()]} {now.getFullYear()}</strong>.</p>
              <p style={{ marginTop: '10px' }}>Would you like to continue with your existing budgets?</p>
              <div className="rollover-budgets-preview">
                {budgets.slice(0, 4).map((b, i) => (
                  <span key={i} className="rollover-badge" style={{ backgroundColor: `${b.color}20`, color: b.color }}>
                    {b.icon} {b.category}
                  </span>
                ))}
                {budgets.length > 4 && <span className="rollover-badge">+{budgets.length - 4} more</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" disabled={rolloverLoading} onClick={() => handleRollover(false)}>No, I'll create new ones</button>
              <button className="btn btn-primary" disabled={rolloverLoading} onClick={() => handleRollover(true)}>
                {rolloverLoading ? 'Setting up...' : 'Yes, continue with same'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Budget</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" placeholder="e.g., FOOD, TRANSPORT, HOUSING"
                  value={newBudget.category}
                  onChange={e => setNewBudget({ ...newBudget, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Monthly Budget (Ksh)</label>
                <input type="number" placeholder="0.00"
                  value={newBudget.budget}
                  onChange={e => setNewBudget({ ...newBudget, budget: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Icon</label>
                  <div className="icon-selector">
                    {iconOptions.map(icon => (
                      <button key={icon} className={`icon-option ${newBudget.icon === icon ? 'active' : ''}`}
                        onClick={() => setNewBudget({ ...newBudget, icon })}>{icon}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group half">
                  <label>Color</label>
                  <div className="color-selector">
                    {colorOptions.map(color => (
                      <button key={color} className={`color-option ${newBudget.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewBudget({ ...newBudget, color })} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateBudget}>Create Budget</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBudget && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBudget.icon} {selectedBudget.category} Details
                {isHistorical && <span className="history-tag"> — {selectedMonthLabel}</span>}
              </h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-summary">
                <div className="detail-item"><span>Budget</span><strong>Ksh {selectedBudget.budget.toLocaleString()}</strong></div>
                <div className="detail-item"><span>Spent</span><strong>Ksh {selectedBudget.spent.toLocaleString()}</strong></div>
                <div className="detail-item">
                  <span>Remaining</span>
                  <strong className={selectedBudget.budget - selectedBudget.spent > 0 ? 'positive' : 'negative'}>
                    Ksh {(selectedBudget.budget - selectedBudget.spent).toLocaleString()}
                  </strong>
                </div>
              </div>
              <div className="details-stats">
                <div className="stat-box"><span>Transactions</span><h3>{loadingTransactions ? '...' : categoryTransactions.length}</h3></div>
                <div className="stat-box">
                  <span>Avg. Transaction</span>
                  <h3>Ksh {categoryTransactions.length > 0 ? Math.round(selectedBudget.spent / categoryTransactions.length).toLocaleString() : 0}</h3>
                </div>
                <div className="stat-box"><span>Daily Avg</span><h3>Ksh {Math.round(selectedBudget.spent / 30).toLocaleString()}</h3></div>
                <div className="stat-box"><span>Period</span><h3>{selectedBudget.budgetPeriod}</h3></div>
              </div>
              <div className="recent-transactions-preview">
                <h3>{isHistorical ? `Transactions — ${selectedMonthLabel}` : 'Recent Transactions'}</h3>
                <div className="preview-list">
                  {loadingTransactions ? (
                    <Loader fullPage={false} message="Loading transactions..." />
                  ) : categoryTransactions.length > 0 ? (
                    categoryTransactions.map(t => (
                      <div key={t.transactionId} className="preview-item">
                        <span className="preview-desc">{t.rawMessage?.length > 40 ? t.rawMessage.substring(0, 40) + '…' : t.rawMessage}</span>
                        <span className="preview-date">{t.creationDate}</span>
                        <span className="preview-amount negative">-Ksh {t.amount?.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-preview">No transactions for this category</p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
              {!isHistorical && (
                <button className="btn btn-primary" onClick={() => { setShowDetailsModal(false); handleAdjustClick(selectedBudget); }}>Adjust Budget</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && adjustBudget && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust {adjustBudget.category} Budget</h2>
              <button className="close-btn" onClick={() => setShowAdjustModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>New Budget Amount (Ksh)</label>
                <input type="number" value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  placeholder="Enter new amount" autoFocus />
              </div>
              <div className="current-info">
                <p>Current budget: <strong>Ksh {adjustBudget.budget.toLocaleString()}</strong></p>
                <p>Spent so far: <strong>Ksh {adjustBudget.spent.toLocaleString()}</strong></p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdjustBudget}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Budget</h2>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body"><p>Are you sure you want to delete this budget? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteBudget}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BudgetsPage;