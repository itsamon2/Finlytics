import React, { useState, useMemo } from 'react';
import './Budgets.styles.css';

const BudgetsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [sortBy, setSortBy] = useState('category');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    budget: '',
    color: '#2DD4BF',
    transactions: 0
  });

  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Housing', budget: 1500, spent: 1200, remaining: 300, color: '#2DD4BF', transactions: 8 },
    { id: 2, category: 'Food', budget: 800, spent: 650, remaining: 150, color: '#F59E0B', transactions: 23 },
    { id: 3, category: 'Transport', budget: 500, spent: 420, remaining: 80, color: '#3B82F6', transactions: 12 },
    { id: 4, category: 'Entertainment', budget: 400, spent: 310, remaining: 90, color: '#8B5CF6', transactions: 6 },
    { id: 5, category: 'Utilities', budget: 300, spent: 280, remaining: 20, color: '#EC4899', transactions: 4 },
    { id: 6, category: 'Shopping', budget: 350, spent: 180, remaining: 170, color: '#EF4444', transactions: 5 }
  ]);

  const colorOptions = [
    '#2DD4BF', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#F97316'
  ];

  const filteredBudgets = useMemo(() => {
    return budgets.filter(budget => {
      const percentage = (budget.spent / budget.budget) * 100;
      
      switch(budgetFilter) {
        case 'on-track':
          return percentage < 75;
        case 'warning':
          return percentage >= 75 && percentage < 90;
        case 'over':
          return percentage >= 90 || budget.spent > budget.budget;
        default:
          return true;
      }
    }).sort((a, b) => {
      switch(sortBy) {
        case 'category':
          return a.category.localeCompare(b.category);
        case 'budget':
          return b.budget - a.budget;
        case 'spent':
          return b.spent - a.spent;
        case 'progress':
          return (b.spent / b.budget) - (a.spent / a.budget);
        default:
          return 0;
      }
    });
  }, [budgets, budgetFilter, sortBy]);

  const insights = useMemo(() => {
    const total = budgets.length;
    const onTrack = budgets.filter(b => (b.spent / b.budget) * 100 < 75).length;
    const warning = budgets.filter(b => {
      const p = (b.spent / b.budget) * 100;
      return p >= 75 && p < 90;
    }).length;
    const over = budgets.filter(b => (b.spent / b.budget) * 100 >= 90 || b.spent > b.budget).length;
    
    return {
      total,
      onTrack,
      warning,
      over,
      healthScore: Math.round((onTrack / total) * 100),
      needsAdjustment: budgets
        .filter(b => (b.spent / b.budget) * 100 > 80)
        .map(b => b.category)
    };
  }, [budgets]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const changeMonth = (direction) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const [month, year] = selectedMonth.split(' ');
    let monthIndex = months.indexOf(month);
    let currentYear = parseInt(year);
    
    monthIndex += direction;
    
    if (monthIndex < 0) {
      monthIndex = 11;
      currentYear -= 1;
    } else if (monthIndex > 11) {
      monthIndex = 0;
      currentYear += 1;
    }
    
    setSelectedMonth(`${months[monthIndex]} ${currentYear}`);
  };

  const handleCreateBudget = () => {
    setModalMode('create');
    setBudgetForm({ category: '', budget: '', color: '#2DD4BF', transactions: 0 });
    setShowBudgetModal(true);
  };

  const handleEditBudget = (budget) => {
    setModalMode('edit');
    setSelectedBudget(budget);
    setBudgetForm({
      category: budget.category,
      budget: budget.budget,
      color: budget.color,
      transactions: budget.transactions
    });
    setShowBudgetModal(true);
  };

  const handleViewDetails = (budget) => {
    setSelectedBudget(budget);
    setShowDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBudgetForm(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setBudgetForm(prev => ({ ...prev, color }));
  };

  const handleSaveBudget = () => {
    if (!budgetForm.category || !budgetForm.budget) {
      alert('Please fill in all fields');
      return;
    }

    const budgetAmount = parseFloat(budgetForm.budget);
    
    if (modalMode === 'create') {
      const newBudget = {
        id: budgets.length + 1,
        category: budgetForm.category,
        budget: budgetAmount,
        spent: 0,
        remaining: budgetAmount,
        color: budgetForm.color,
        transactions: 0
      };
      setBudgets([...budgets, newBudget]);
    } else {
      const updatedBudgets = budgets.map(b => 
        b.id === selectedBudget.id 
          ? { ...b, category: budgetForm.category, budget: budgetAmount, remaining: budgetAmount - b.spent, color: budgetForm.color }
          : b
      );
      setBudgets(updatedBudgets);
    }
    setShowBudgetModal(false);
  };

  const handleDeleteBudget = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter(b => b.id !== id));
      setShowDetailsModal(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Category', 'Budget', 'Spent', 'Remaining', 'Utilization %', 'Transactions'],
      ...filteredBudgets.map(b => [
        b.category,
        b.budget,
        b.spent,
        b.remaining,
        Math.round((b.spent / b.budget) * 100),
        b.transactions
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgets-${selectedMonth.replace(' ', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="budgets-page">
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p className="page-subtitle">Track your monthly spending limits</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <span className="btn-icon">📊</span>
            Export
          </button>
          <button className="btn btn-primary" onClick={handleCreateBudget}>
            <span className="btn-icon">+</span>
            Create Budget
          </button>
        </div>
      </div>

      <div className="budget-overview">
        <div className="overview-card total">
          <span className="overview-label">Total Budget</span>
          <span className="overview-value">${totalBudget.toLocaleString()}</span>
        </div>
        <div className="overview-card spent">
          <span className="overview-label">Total Spent</span>
          <span className="overview-value">${totalSpent.toLocaleString()}</span>
          <span className="overview-percentage">{Math.round((totalSpent/totalBudget)*100)}%</span>
        </div>
        <div className="overview-card remaining">
          <span className="overview-label">Remaining</span>
          <span className="overview-value">${totalRemaining.toLocaleString()}</span>
        </div>
        <div className="overview-card average">
          <span className="overview-label">Avg. Daily</span>
          <span className="overview-value">${Math.round(totalSpent/30)}</span>
        </div>
      </div>

      {/* Insights Dashboard */}
      <div className="insights-dashboard">
        <div className="insights-header">
          <h3>Budget Health Dashboard</h3>
          <div className="health-score-badge">
            <span className="score-label">Health Score</span>
            <span className="score-value">{insights.healthScore}%</span>
          </div>
        </div>

        <div className="health-meter">
          <div className="meter-bar">
            <div className="meter-segment healthy" style={{ width: `${(insights.onTrack / insights.total) * 100}%` }}>
              <span className="meter-tooltip">On Track: {insights.onTrack}</span>
            </div>
            <div className="meter-segment warning" style={{ width: `${(insights.warning / insights.total) * 100}%` }}>
              <span className="meter-tooltip">Warning: {insights.warning}</span>
            </div>
            <div className="meter-segment over" style={{ width: `${(insights.over / insights.total) * 100}%` }}>
              <span className="meter-tooltip">Over: {insights.over}</span>
            </div>
          </div>
        </div>

        <div className="insights-grid-enhanced">
          <div className="insight-card healthy">
            <div className="insight-icon">✅</div>
            <div className="insight-content">
              <span className="insight-card-label">On Track</span>
              <span className="insight-card-value">{insights.onTrack}</span>
              <span className="insight-card-sub">categories</span>
            </div>
          </div>

          <div className="insight-card warning">
            <div className="insight-icon">⚠️</div>
            <div className="insight-content">
              <span className="insight-card-label">Warning</span>
              <span className="insight-card-value">{insights.warning}</span>
              <span className="insight-card-sub">need attention</span>
            </div>
          </div>

          <div className="insight-card over">
            <div className="insight-icon">🔴</div>
            <div className="insight-content">
              <span className="insight-card-label">Over Budget</span>
              <span className="insight-card-value">{insights.over}</span>
              <span className="insight-card-sub">exceeded</span>
            </div>
          </div>

          <div className="insight-card total">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <span className="insight-card-label">Total Categories</span>
              <span className="insight-card-value">{insights.total}</span>
              <span className="insight-card-sub">active</span>
            </div>
          </div>
        </div>

        {insights.needsAdjustment.length > 0 && (
          <div className="insight-alert-banner">
            <div className="alert-icon">💡</div>
            <div className="alert-message">
              <strong>Consider reviewing:</strong> {insights.needsAdjustment.join(' • ')}
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS SECTION */}
      <div className="controls-wrapper">
        {/* Top Row - Month & View Toggle */}
        <div className="controls-top">
          <div className="month-indicator">
            <button className="month-btn" onClick={() => changeMonth(-1)}>←</button>
            <span className="current-month">{selectedMonth}</span>
            <button className="month-btn" onClick={() => changeMonth(1)}>→</button>
          </div>

          <div className="display-options">
            <button 
              className={`display-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`display-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Filter Bar - */}
        <div className="filter-bar">
          <div className="filter-group">
            <button 
              className={`filter-item ${budgetFilter === 'all' ? 'active' : ''}`}
              onClick={() => setBudgetFilter('all')}
            >
              All <span className="filter-count">{insights.total}</span>
            </button>
            <button 
              className={`filter-item ${budgetFilter === 'on-track' ? 'active' : ''}`}
              onClick={() => setBudgetFilter('on-track')}
            >
              On Track <span className="filter-count">{insights.onTrack}</span>
            </button>
            <button 
              className={`filter-item ${budgetFilter === 'warning' ? 'active' : ''}`}
              onClick={() => setBudgetFilter('warning')}
            >
              Warning <span className="filter-count">{insights.warning}</span>
            </button>
            <button 
              className={`filter-item ${budgetFilter === 'over' ? 'active' : ''}`}
              onClick={() => setBudgetFilter('over')}
            >
              Over <span className="filter-count">{insights.over}</span>
            </button>
          </div>

          <div className="sort-wrapper">
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="category">Category</option>
              <option value="budget">Budget</option>
              <option value="spent">Spent</option>
              <option value="progress">Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budget Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="budget-grid">
          {filteredBudgets.map((budget) => {
            const percentage = (budget.spent / budget.budget) * 100;
            const isOverBudget = budget.spent > budget.budget;
            const statusClass = percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : 'good';
            
            return (
              <div key={budget.id} className={`budget-card status-${statusClass}`}>
                <div className="budget-card-header" style={{ borderTopColor: budget.color }}>
                  <div className="budget-category">
                    <span className="category-dot" style={{ backgroundColor: budget.color }}></span>
                    <h3>{budget.category}</h3>
                  </div>
                  <span className="budget-transactions">{budget.transactions} transactions</span>
                </div>

                <div className="budget-card-stats">
                  <div className="stat-row">
                    <span>Budget</span>
                    <span className="stat-value">${budget.budget.toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span>Spent</span>
                    <span className="stat-value">${budget.spent.toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span>Remaining</span>
                    <span className={`stat-value ${isOverBudget ? 'over' : ''}`}>
                      {isOverBudget ? '-' : ''}${Math.abs(budget.remaining).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="budget-progress-container">
                  <div className="budget-progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">{Math.round(percentage)}%</span>
                  </div>
                  <div className="budget-progress-bar">
                    <div 
                      className={`budget-progress-fill ${statusClass}`}
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOverBudget ? '#EF4444' : budget.color
                      }}
                    ></div>
                  </div>
                </div>

                <div className="budget-card-actions">
                  <button className="action-btn" onClick={() => handleViewDetails(budget)}>View Details</button>
                  <button className="action-btn" onClick={() => handleEditBudget(budget)}>Adjust</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="budget-list-container">
          <div className="budget-list-header">
            <span>Category</span>
            <span>Budget</span>
            <span>Spent</span>
            <span>Remaining</span>
            <span>Progress</span>
            <span>Actions</span>
          </div>
          {filteredBudgets.map((budget) => {
            const percentage = (budget.spent / budget.budget) * 100;
            const isOverBudget = budget.spent > budget.budget;
            
            return (
              <div key={budget.id} className="budget-list-row">
                <div className="list-category">
                  <span className="category-dot" style={{ backgroundColor: budget.color }}></span>
                  <span>{budget.category}</span>
                </div>
                <span>${budget.budget.toLocaleString()}</span>
                <span>${budget.spent.toLocaleString()}</span>
                <span className={isOverBudget ? 'over' : ''}>
                  {isOverBudget ? '-' : ''}${Math.abs(budget.remaining).toLocaleString()}
                </span>
                <div className="list-progress">
                  <div className="list-progress-bar">
                    <div 
                      className="list-progress-fill"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOverBudget ? '#EF4444' : budget.color
                      }}
                    ></div>
                  </div>
                  <span className="list-percentage">{Math.round(percentage)}%</span>
                </div>
                <div className="list-actions">
                  <button className="action-btn small" onClick={() => handleViewDetails(budget)} title="View Details">👁️</button>
                  <button className="action-btn small" onClick={() => handleEditBudget(budget)} title="Edit">✎</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
          <div className="modal-content budget-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Create New Budget' : 'Edit Budget'}</h2>
              <button className="close-btn" onClick={() => setShowBudgetModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  name="category"
                  value={budgetForm.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Groceries, Rent, Entertainment"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Monthly Budget ($)</label>
                <input
                  type="number"
                  name="budget"
                  value={budgetForm.budget}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="100"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Budget Color</label>
                <div className="color-picker">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      className={`color-option ${budgetForm.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBudgetModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveBudget}>
                {modalMode === 'create' ? 'Create Budget' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedBudget && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBudget.category} Budget Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-summary" style={{ borderTopColor: selectedBudget.color }}>
                <div className="summary-item">
                  <span className="summary-item-label">Monthly Budget</span>
                  <span className="summary-item-value">${selectedBudget.budget.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Current Spent</span>
                  <span className="summary-item-value">${selectedBudget.spent.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Remaining</span>
                  <span className={`summary-item-value ${selectedBudget.remaining < 0 ? 'negative' : ''}`}>
                    {selectedBudget.remaining < 0 ? '-' : ''}${Math.abs(selectedBudget.remaining).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="details-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span className="progress-percentage">
                    {Math.round((selectedBudget.spent / selectedBudget.budget) * 100)}%
                  </span>
                </div>
                <div className="progress-bar-large">
                  <div 
                    className="progress-fill-large"
                    style={{ 
                      width: `${Math.min((selectedBudget.spent / selectedBudget.budget) * 100, 100)}%`,
                      backgroundColor: selectedBudget.color
                    }}
                  ></div>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-card-label">Transactions</span>
                  <span className="stat-card-value">{selectedBudget.transactions}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card-label">Avg. per Transaction</span>
                  <span className="stat-card-value">
                    ${selectedBudget.transactions > 0 
                      ? Math.round(selectedBudget.spent / selectedBudget.transactions).toLocaleString() 
                      : 0}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-card-label">Daily Average</span>
                  <span className="stat-card-value">${Math.round(selectedBudget.spent / 30).toLocaleString()}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card-label">Projected End</span>
                  <span className="stat-card-value">
                    {selectedBudget.spent > selectedBudget.budget 
                      ? 'Over Budget' 
                      : `${Math.round((selectedBudget.spent / selectedBudget.budget) * 30)} days`}
                  </span>
                </div>
              </div>
              <div className="recent-transactions-preview">
                <h3>Recent Transactions</h3>
                <div className="preview-list">
                  <div className="preview-item">
                    <span className="preview-desc">Whole Foods Market</span>
                    <span className="preview-date">Mar 3</span>
                    <span className="preview-amount negative">-$85.20</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-desc">Trader Joe's</span>
                    <span className="preview-date">Mar 1</span>
                    <span className="preview-amount negative">-$45.30</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-desc">Kroger</span>
                    <span className="preview-date">Feb 28</span>
                    <span className="preview-amount negative">-$32.50</span>
                  </div>
                </div>
                <button className="view-all-btn">View All Transactions →</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => handleEditBudget(selectedBudget)}>
                Edit Budget
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteBudget(selectedBudget.id)}>
                Delete Budget
              </button>
              <button className="btn btn-primary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;