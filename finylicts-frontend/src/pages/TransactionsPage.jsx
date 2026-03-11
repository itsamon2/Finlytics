import React, { useState, useMemo } from 'react';
import './Transactions.styles.css';

const TransactionsPage = () => {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Static transaction data
  const transactions = [
    { id: 1, date: '2026-03-03', description: 'Grocery Store', amount: -82.50 },
    { id: 2, date: '2026-03-01', description: 'Salary Deposit', amount: 5240.00 },
    { id: 3, date: '2026-02-28', description: 'Netflix', amount: -15.99 },
    { id: 4, date: '2026-02-27', description: 'Gas Station', amount: -45.20 },
    { id: 5, date: '2026-02-26', description: 'Freelance Work', amount: 850.00 },
    { id: 6, date: '2026-02-25', description: 'Restaurant', amount: -65.30 },
    { id: 7, date: '2026-02-24', description: 'Electric Bill', amount: -120.00 },
    { id: 8, date: '2026-02-23', description: 'Amazon', amount: -89.99 },
  ];

  // Filter by date range
  const filterByDateRange = (transaction) => {
    const today = new Date();
    const transactionDate = new Date(transaction.date);
    
    switch(dateRange) {
      case 'this-month':
        return transactionDate.getMonth() === today.getMonth() && 
               transactionDate.getFullYear() === today.getFullYear();
      case 'last-month':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return transactionDate.getMonth() === lastMonth.getMonth() &&
               transactionDate.getFullYear() === lastMonth.getFullYear();
      case 'last-3-months':
        const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
        return transactionDate >= threeMonthsAgo;
      case 'this-year':
        return transactionDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  };

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        if (filter === 'income' && transaction.amount < 0) return false;
        if (filter === 'expenses' && transaction.amount > 0) return false;
        if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return filterByDateRange(transaction);
      })
      .sort((a, b) => {
        switch(sortBy) {
          case 'newest':
            return new Date(b.date) - new Date(a.date);
          case 'oldest':
            return new Date(a.date) - new Date(b.date);
          case 'highest':
            return Math.abs(b.amount) - Math.abs(a.amount);
          case 'lowest':
            return Math.abs(a.amount) - Math.abs(b.amount);
          default:
            return 0;
        }
      });
  }, [filter, searchTerm, dateRange, sortBy]);

  // Summary stats
  const summary = {
    totalIncome: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    averageDaily: 124.50
  };

  // Quick stats
  const quickStats = {
    largestIncome: Math.max(...transactions.filter(t => t.amount > 0).map(t => t.amount)),
    largestExpense: Math.min(...transactions.filter(t => t.amount < 0).map(t => t.amount)),
    totalCount: filteredTransactions.length,
    averageAmount: (summary.totalIncome + summary.totalExpenses) / transactions.length
  };

  // Handle export
  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const csvContent = [
      ['Date', 'Description', 'Amount'],
      ...filteredTransactions.map(t => [
        t.date,
        t.description,
        t.amount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert(`Exported ${filteredTransactions.length} transactions`);
  };

  // Group by date for display
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(transaction);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p className="page-subtitle">View your transaction history</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <span className="btn-icon">📊</span>
            Export ({filteredTransactions.length})
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
          <div className="summary-icon daily">📅</div>
          <div className="summary-details">
            <span className="summary-label">Avg. Daily</span>
            <span className="summary-value">${summary.averageDaily}</span>
          </div>
        </div>
      </div>

      {/* Toolbar with Sort and Quick Stats */}
      <div className="transactions-toolbar">
        <div className="sort-dropdown-wrapper">
          <select 
            className="sort-select-modern"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
          <span className="sort-icon">▼</span>
        </div>
        
        <div className="quick-stats">
          <span>📊 {filteredTransactions.length} transactions</span>
          <span>💰 Largest: ${quickStats.largestIncome?.toLocaleString() || 0}</span>
          <span>📉 Smallest: ${Math.abs(quickStats.largestExpense || 0).toLocaleString()}</span>
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
                <div key={transaction.id} className="transaction-row">
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="transaction-description">{transaction.description}</span>
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