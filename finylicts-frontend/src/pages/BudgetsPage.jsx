// src/pages/BudgetsPage.jsx
import React, { useState } from 'react';
import './Budgets.styles.css';

const BudgetsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  
  // Form state for creating/editing budgets
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    budget: '',
    color: '#2DD4BF',
    transactions: 0
  });

  // Static budget data
  const [budgets, setBudgets] = useState([
    { 
      id: 1,
      category: 'Housing', 
      budget: 1500, 
      spent: 1200,
      remaining: 300,
      color: '#2DD4BF',
      transactions: 8
    },
    { 
      id: 2,
      category: 'Food', 
      budget: 800, 
      spent: 650,
      remaining: 150,
      color: '#F59E0B',
      transactions: 23
    },
    { 
      id: 3,
      category: 'Transport', 
      budget: 500, 
      spent: 420,
      remaining: 80,
      color: '#3B82F6',
      transactions: 12
    },
    { 
      id: 4,
      category: 'Entertainment', 
      budget: 400, 
      spent: 310,
      remaining: 90,
      color: '#8B5CF6',
      transactions: 6
    },
    { 
      id: 5,
      category: 'Utilities', 
      budget: 300, 
      spent: 280,
      remaining: 20,
      color: '#EC4899',
      transactions: 4
    },
    { 
      id: 6,
      category: 'Shopping', 
      budget: 350, 
      spent: 180,
      remaining: 170,
      color: '#EF4444',
      transactions: 5
    }
  ]);

  // Available colors for budgets
  const colorOptions = [
    '#2DD4BF', // Teal
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#10B981', // Green
    '#F97316', // Orange
  ];

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Handle month navigation
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

  // Open create budget modal
  const handleCreateBudget = () => {
    setModalMode('create');
    setBudgetForm({
      category: '',
      budget: '',
      color: '#2DD4BF',
      transactions: 0
    });
    setShowBudgetModal(true);
  };

  // Open edit budget modal
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

  // Open view details modal
  const handleViewDetails = (budget) => {
    setSelectedBudget(budget);
    setShowDetailsModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBudgetForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setBudgetForm(prev => ({
      ...prev,
      color
    }));
  };

  // Save budget (create or update)
  const handleSaveBudget = () => {
    if (!budgetForm.category || !budgetForm.budget) {
      alert('Please fill in all fields');
      return;
    }

    const budgetAmount = parseFloat(budgetForm.budget);
    
    if (modalMode === 'create') {
      // Create new budget
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
      // Update existing budget
      const updatedBudgets = budgets.map(b => 
        b.id === selectedBudget.id 
          ? {
              ...b,
              category: budgetForm.category,
              budget: budgetAmount,
              remaining: budgetAmount - b.spent,
              color: budgetForm.color
            }
          : b
      );
      setBudgets(updatedBudgets);
    }
    
    setShowBudgetModal(false);
  };

  // Handle delete budget
  const handleDeleteBudget = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter(b => b.id !== id));
      setShowDetailsModal(false);
    }
  };

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['Category', 'Budget', 'Spent', 'Remaining', 'Utilization %', 'Transactions'],
      ...budgets.map(b => [
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

      {/* Overview Cards */}
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

      {/* Controls */}
      <div className="budget-controls">
        <div className="month-selector">
          <button className="month-nav" onClick={() => changeMonth(-1)}>←</button>
          <span className="current-month">{selectedMonth}</span>
          <button className="month-nav" onClick={() => changeMonth(1)}>→</button>
        </div>

        <div className="view-toggles">
          <button 
            className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
          <button 
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {/* Budget Grid */}
      {viewMode === 'grid' ? (
        <div className="budget-grid">
          {budgets.map((budget) => {
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
        // List View
        <div className="budget-list-container">
          <div className="budget-list-header">
            <span>Category</span>
            <span>Budget</span>
            <span>Spent</span>
            <span>Remaining</span>
            <span>Progress</span>
            <span>Actions</span>
          </div>
          {budgets.map((budget) => {
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
              <button className="btn btn-secondary" onClick={() => setShowBudgetModal(false)}>
                Cancel
              </button>
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
              {/* Summary Card */}
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

              {/* Progress Bar */}
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

              {/* Stats Grid */}
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

              {/* Recent Transactions Preview */}
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