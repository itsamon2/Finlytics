import React, { useState } from 'react';
import './Transactions.styles.css';

const TransactionsPage = () => {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');
  const [searchTerm, setSearchTerm] = useState('');

  // Static transaction data (matches what backend will return)
  const transactions = [
    { id: 1, date: '2026-03-03', description: 'Grocery Store', category: 'Food', amount: -82.50, status: 'completed' },
    { id: 2, date: '2026-03-01', description: 'Salary Deposit', category: 'Income', amount: 5240.00, status: 'completed' },
    { id: 3, date: '2026-02-28', description: 'Netflix', category: 'Entertainment', amount: -15.99, status: 'completed' },
    { id: 4, date: '2026-02-27', description: 'Gas Station', category: 'Transport', amount: -45.20, status: 'completed' },
    { id: 5, date: '2026-02-26', description: 'Freelance Work', category: 'Income', amount: 850.00, status: 'completed' },
    { id: 6, date: '2026-02-25', description: 'Restaurant', category: 'Food', amount: -65.30, status: 'completed' },
    { id: 7, date: '2026-02-24', description: 'Electric Bill', category: 'Utilities', amount: -120.00, status: 'pending' },
    { id: 8, date: '2026-02-23', description: 'Amazon', category: 'Shopping', amount: -89.99, status: 'completed' },
  ];

  // Filter transactions based on selected filter and search
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (filter === 'income' && transaction.amount < 0) return false;
    if (filter === 'expenses' && transaction.amount > 0) return false;
    
    // Search by description
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  // Summary stats
  const summary = {
    totalIncome: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    pendingCount: transactions.filter(t => t.status === 'pending').length,
    averageDaily: 124.50
  };

  // Handle export
  const handleExport = () => {
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    
    if (dataToExport.length === 0) {
      alert('No transactions to export');
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Date', 'Description', 'Category', 'Amount', 'Status'],
      ...dataToExport.map(t => [
        t.date,
        t.description,
        t.category,
        t.amount,
        t.status
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    //Show success message
    alert(`Successfully exported ${dataToExport.length} transactions`);
  };

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="transactions-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="page-subtitle">View your transaction history</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <span className="btn-icon">📊</span>
            Export {filteredTransactions.length > 0 ? `(${filteredTransactions.length})` : ''}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="transactions-summary">
        <div className="summary-card">
          <div className="summary-icon income">💰</div>
          <div className="summary-details">
            <span className="summary-label">Total Income</span>
            <span className="summary-value positive">+${summary.totalIncome.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon expenses">📉</div>
          <div className="summary-details">
            <span className="summary-label">Total Expenses</span>
            <span className="summary-value negative">-${summary.totalExpenses.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon pending">⏳</div>
          <div className="summary-details">
            <span className="summary-label">Pending</span>
            <span className="summary-value">{summary.pendingCount}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon daily">📅</div>
          <div className="summary-details">
            <span className="summary-label">Avg. Daily</span>
            <span className="summary-value">${summary.averageDaily}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab ${filter === 'income' ? 'active' : ''}`}
              onClick={() => setFilter('income')}
            >
              Income
            </button>
            <button 
              className={`filter-tab ${filter === 'expenses' ? 'active' : ''}`}
              onClick={() => setFilter('expenses')}
            >
              Expenses
            </button>
          </div>

          <select 
            className="date-range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-list-container">
        <div className="transactions-header">
          <span>Date</span>
          <span>Description</span>
          <span>Category</span>
          <span>Status</span>
          <span>Amount</span>
        </div>

        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="date-group">
              <div className="date-header">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              {groupedTransactions[date].map(transaction => (
                <div key={transaction.id} className="transaction-row view-only">
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="transaction-description">{transaction.description}</span>
                  <span className="transaction-category">
                    <span className={`category-badge category-${transaction.category.toLowerCase()}`}>
                      {transaction.category}
                    </span>
                  </span>
                  <span className="transaction-status">
                    <span className={`status-badge status-${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </span>
                  <span className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="no-transactions">
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;