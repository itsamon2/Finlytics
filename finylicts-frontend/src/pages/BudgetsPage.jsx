// src/pages/BudgetsPage.jsx
import React, { useState } from 'react';
import './Budgets.styles.css';

const BudgetsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustBudget, setAdjustBudget] = useState(null);
  
  const [budgets, setBudgets] = useState([
    { 
      id: 1,
      category: 'Housing', 
      budget: 1500, 
      spent: 1200,
      color: '#2DD4BF',
      icon: '🏠',
      trend: '-5%',
      transactions: 8
    },
    { 
      id: 2,
      category: 'Food', 
      budget: 800, 
      spent: 650,
      color: '#F59E0B',
      icon: '🍔',
      trend: '+2%',
      transactions: 23
    },
    { 
      id: 3,
      category: 'Transport', 
      budget: 500, 
      spent: 420,
      color: '#3B82F6',
      icon: '🚗',
      trend: '-8%',
      transactions: 12
    },
    { 
      id: 4,
      category: 'Entertainment', 
      budget: 400, 
      spent: 310,
      color: '#8B5CF6',
      icon: '🎬',
      trend: '-12%',
      transactions: 6
    },
    { 
      id: 5,
      category: 'Utilities', 
      budget: 300, 
      spent: 280,
      color: '#EC4899',
      icon: '💡',
      trend: '+3%',
      transactions: 4
    },
    { 
      id: 6,
      category: 'Shopping', 
      budget: 350, 
      spent: 180,
      color: '#EF4444',
      icon: '🛍️',
      trend: '-25%',
      transactions: 5
    }
  ]);

  const [newBudget, setNewBudget] = useState({
    category: '',
    budget: '',
    color: '#2DD4BF',
    icon: '💰'
  });

  const [adjustAmount, setAdjustAmount] = useState('');

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const savingsRate = Math.round((remaining / totalBudget) * 100);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];

  const colorOptions = [
    '#2DD4BF', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#F97316'
  ];

  const iconOptions = ['🏠', '🍔', '🚗', '🎬', '💡', '🛍️', '💰', '📚', '🏥', '✈️'];

  // Month navigation
  const changeMonth = (direction) => {
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

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Category', 'Budget', 'Spent', 'Remaining', 'Spent %', 'Transactions'],
      ...budgets.map(b => [
        b.category,
        b.budget,
        b.spent,
        b.budget - b.spent,
        Math.round((b.spent / b.budget) * 100) + '%',
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
    
    // Show success message
    alert(`✅ Exported ${budgets.length} budgets for ${selectedMonth}`);
  };

  // Create budget
  const handleCreateBudget = () => {
    if (!newBudget.category || !newBudget.budget) {
      alert('Please fill in all fields');
      return;
    }

    const budgetAmount = parseFloat(newBudget.budget);
    
    const createdBudget = {
      id: budgets.length + 1,
      category: newBudget.category,
      budget: budgetAmount,
      spent: 0,
      remaining: budgetAmount,
      color: newBudget.color,
      icon: newBudget.icon,
      trend: '0%',
      transactions: 0
    };

    setBudgets([...budgets, createdBudget]);
    setShowCreateModal(false);
    setNewBudget({ category: '', budget: '', color: '#2DD4BF', icon: '💰' });
    alert(`✅ Budget created for ${newBudget.category}`);
  };

  // View details
  const handleViewDetails = (budget) => {
    setSelectedBudget(budget);
    setShowDetailsModal(true);
  };

  // Adjust budget
  const handleAdjustClick = (budget) => {
    setAdjustBudget(budget);
    setAdjustAmount(budget.budget.toString());
    setShowAdjustModal(true);
  };

  const handleAdjustBudget = () => {
    const newAmount = parseFloat(adjustAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const updatedBudgets = budgets.map(b => 
      b.id === adjustBudget.id 
        ? { 
            ...b, 
            budget: newAmount,
            remaining: newAmount - b.spent
          }
        : b
    );

    setBudgets(updatedBudgets);
    setShowAdjustModal(false);
    setAdjustBudget(null);
    alert(`✅ Budget adjusted to $${newAmount.toLocaleString()}`);
  };

  // Delete budget
  const handleDeleteClick = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleDeleteBudget = () => {
    const deletedBudget = budgets.find(b => b.id === showDeleteConfirm);
    setBudgets(budgets.filter(b => b.id !== showDeleteConfirm));
    setShowDeleteConfirm(null);
    alert(`🗑️ Budget deleted: ${deletedBudget.category}`);
  };

  return (
    <div className="budgets-page">
      {/* Header Section */}
      <div className="budgets-header">
        <div>
          <h1>Budget Planner</h1>
          <p className="header-subtitle">Track and manage your monthly spending</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <span>📊</span> Export
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <span>+</span> Create Budget
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card total">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">Total Budget</span>
            <span className="card-value">${totalBudget.toLocaleString()}</span>
          </div>
        </div>
        <div className="overview-card spent">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <span className="card-label">Total Spent</span>
            <span className="card-value">${totalSpent.toLocaleString()}</span>
          </div>
        </div>
        <div className="overview-card remaining">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <span className="card-label">Remaining</span>
            <span className="card-value">${remaining.toLocaleString()}</span>
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

      {/* Budget Health */}
      <div className="health-card">
        <div className="health-header">
          <h3>Budget Health</h3>
          <span className="health-score">{savingsRate}%</span>
        </div>
        <div className="health-bar">
          <div className="health-progress" style={{ width: `${100 - savingsRate}%` }}></div>
        </div>
        <p className="health-note">
          You're doing great! You've saved {savingsRate}% of your total budget.
        </p>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="month-selector">
          <button className="month-nav" onClick={() => changeMonth(-1)}>←</button>
          <span className="current-month">{selectedMonth}</span>
          <button className="month-nav" onClick={() => changeMonth(1)}>→</button>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <span>⊞</span> Grid
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <span>☰</span> List
          </button>
        </div>
      </div>

      {/* Budget Grid */}
      {viewMode === 'grid' ? (
        <div className="budget-grid">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.budget) * 100;
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
                      <span className="budget-trend">{budget.trend} vs last month</span>
                    </div>
                  </div>
                  <button className="menu-btn" onClick={() => handleDeleteClick(budget.id)}>🗑️</button>
                </div>

                <div className="budget-details">
                  <div className="amount-row">
                    <span>Budget</span>
                    <strong>${budget.budget.toLocaleString()}</strong>
                  </div>
                  <div className="amount-row">
                    <span>Spent</span>
                    <strong>${budget.spent.toLocaleString()}</strong>
                  </div>
                  <div className="amount-row">
                    <span>Remaining</span>
                    <strong className={budget.budget - budget.spent > 0 ? 'positive' : 'negative'}>
                      ${(budget.budget - budget.spent).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span style={{ color: budget.color }}>{Math.round(percentage)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: budget.color
                      }}
                    ></div>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="action-btn" onClick={() => handleViewDetails(budget)}>View Details</button>
                  <button className="action-btn" onClick={() => handleAdjustClick(budget)}>Adjust</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="budget-list">
          <div className="list-header">
            <span>Category</span>
            <span>Budget</span>
            <span>Spent</span>
            <span>Remaining</span>
            <span>Progress</span>
            <span></span>
          </div>
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.budget) * 100;
            
            return (
              <div key={budget.id} className="list-row">
                <div className="category-cell">
                  <span className="list-icon" style={{ backgroundColor: `${budget.color}15`, color: budget.color }}>
                    {budget.icon}
                  </span>
                  <span>{budget.category}</span>
                </div>
                <div>${budget.budget.toLocaleString()}</div>
                <div>${budget.spent.toLocaleString()}</div>
                <div className={budget.budget - budget.spent > 0 ? 'positive' : 'negative'}>
                  ${(budget.budget - budget.spent).toLocaleString()}
                </div>
                <div className="progress-cell">
                  <div className="list-progress">
                    <div className="list-progress-bar">
                      <div 
                        className="list-progress-fill"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: budget.color
                        }}
                      ></div>
                    </div>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                </div>
                <div>
                  <button className="list-menu" onClick={() => handleDeleteClick(budget.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Budget Modal */}
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
                <input
                  type="text"
                  placeholder="e.g., Groceries, Rent, Entertainment"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Monthly Budget ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newBudget.budget}
                  onChange={(e) => setNewBudget({...newBudget, budget: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Icon</label>
                  <div className="icon-selector">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        className={`icon-option ${newBudget.icon === icon ? 'active' : ''}`}
                        onClick={() => setNewBudget({...newBudget, icon})}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group half">
                  <label>Color</label>
                  <div className="color-selector">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        className={`color-option ${newBudget.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewBudget({...newBudget, color})}
                      />
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

      {/* View Details Modal */}
      {showDetailsModal && selectedBudget && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBudget.category} Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-summary">
                <div className="detail-item">
                  <span>Budget</span>
                  <strong>${selectedBudget.budget.toLocaleString()}</strong>
                </div>
                <div className="detail-item">
                  <span>Spent</span>
                  <strong>${selectedBudget.spent.toLocaleString()}</strong>
                </div>
                <div className="detail-item">
                  <span>Remaining</span>
                  <strong className={selectedBudget.budget - selectedBudget.spent > 0 ? 'positive' : 'negative'}>
                    ${(selectedBudget.budget - selectedBudget.spent).toLocaleString()}
                  </strong>
                </div>
              </div>
              <div className="details-stats">
                <div className="stat-box">
                  <span>Transactions</span>
                  <h3>{selectedBudget.transactions}</h3>
                </div>
                <div className="stat-box">
                  <span>Avg. Transaction</span>
                  <h3>${Math.round(selectedBudget.spent / selectedBudget.transactions).toLocaleString()}</h3>
                </div>
                <div className="stat-box">
                  <span>Daily Avg</span>
                  <h3>${Math.round(selectedBudget.spent / 30).toLocaleString()}</h3>
                </div>
                <div className="stat-box">
                  <span>Trend</span>
                  <h3 style={{ color: selectedBudget.trend.includes('+') ? '#10B981' : '#EF4444' }}>
                    {selectedBudget.trend}
                  </h3>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                setShowDetailsModal(false);
                handleAdjustClick(selectedBudget);
              }}>Adjust Budget</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Budget Modal */}
      {showAdjustModal && adjustBudget && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust {adjustBudget.category} Budget</h2>
              <button className="close-btn" onClick={() => setShowAdjustModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>New Budget Amount ($)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Enter new amount"
                  autoFocus
                />
              </div>
              <div className="current-info">
                <p>Current budget: <strong>${adjustBudget.budget.toLocaleString()}</strong></p>
                <p>Spent so far: <strong>${adjustBudget.spent.toLocaleString()}</strong></p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdjustBudget}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Budget</h2>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this budget? This action cannot be undone.</p>
            </div>
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