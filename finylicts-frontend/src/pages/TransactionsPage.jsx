import React, { useState, useEffect } from 'react';
import './Transactions.styles.css';
import { transactionService } from '../service/api';

const TransactionsPage = () => {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); 

useEffect(() => {
    const fetchTransactions = () => {
      transactionService.getAll()
        .then(data => {
          // Sort newest first by transactionId
          const sorted = data.sort((a, b) => b.transactionId - a.transactionId);
          setTransactions(sorted);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  // Toggle expanded row
  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'income' && transaction.type !== 'INCOME') return false;
    if (filter === 'expenses' && transaction.type !== 'EXPENSE') return false;
    if (searchTerm &&
        !transaction.rawMessage?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.category?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Summary stats
  const summary = {
    totalIncome: transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: transactions.length,
  };

  // Handle export
  const handleExport = () => {
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    if (dataToExport.length === 0) {
      alert('No transactions to export');
      return;
    }
    const csvContent = [
      ['Date', 'Category', 'Type', 'Amount', 'Message'],
      ...dataToExport.map(t => [
        t.creationDate,
        t.category,
        t.type,
        t.amount,
        `"${t.rawMessage}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert(`Successfully exported ${dataToExport.length} transactions`);
  };

// Group transactions by date
const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.creationDate;
    if (!groups[date]) groups[date] = [];
    groups[date].push(transaction);
    return groups;
}, {});

// Sort dates newest first
const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

// Sort transactions within each date newest first by transactionId
sortedDates.forEach(date => {
    groupedTransactions[date].sort((a, b) => b.transactionId - a.transactionId);
});

  // Category emoji mapper
  const categoryEmoji = {
    FOOD: '🍔',
    TRANSPORT: '🚗',
    UTILITIES: '💡',
    ENTERTAINMENT: '🎬',
    SHOPPING: '🛍️',
    HEALTH: '🏥',
    INCOME: '💰',
    LOAN: '🏦',
    OTHER: '📦'
  };

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error) return <div className="error">Error: {error}</div>;

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
            <span className="summary-value positive">
              +Ksh {summary.totalIncome.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon expenses">📉</div>
          <div className="summary-details">
            <span className="summary-label">Total Expenses</span>
            <span className="summary-value negative">
              -Ksh {summary.totalExpenses.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon pending">🔢</div>
          <div className="summary-details">
            <span className="summary-label">Total Transactions</span>
            <span className="summary-value">{summary.totalTransactions}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon daily">📅</div>
          <div className="summary-details">
            <span className="summary-label">Net Balance</span>
            <span className={`summary-value ${summary.totalIncome - summary.totalExpenses >= 0 ? 'positive' : 'negative'}`}>
              Ksh {(summary.totalIncome - summary.totalExpenses).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by category or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <div className="filter-tabs">
            <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`filter-tab ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')}>Income</button>
            <button className={`filter-tab ${filter === 'expenses' ? 'active' : ''}`} onClick={() => setFilter('expenses')}>Expenses</button>
          </div>
          <select className="date-range" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="this-year">This Year</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-list-container">
        <div className="transactions-header">
          <span>Date</span>
          <span>Category</span>
          <span>Type</span>
          <span>Amount</span>
          <span></span>
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
                <div key={transaction.transactionId}>

                  {/* Main Row */}
                  <div
                    className={`transaction-row ${expandedRow === transaction.transactionId ? 'expanded' : ''}`}
                    onClick={() => toggleRow(transaction.transactionId)}
                  >
                    <span className="transaction-date">
                      {new Date(transaction.creationDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="transaction-category">
                      <span className={`category-badge category-${transaction.category?.toLowerCase()}`}>
                        {categoryEmoji[transaction.category]} {transaction.category}
                      </span>
                    </span>
                    <span className="transaction-status">
                      <span className={`status-badge status-${transaction.type?.toLowerCase()}`}>
                        {transaction.type}
                      </span>
                    </span>
                    <span className={`transaction-amount ${transaction.type === 'INCOME' ? 'positive' : 'negative'}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}Ksh {transaction.amount?.toLocaleString()}
                    </span>
                    <span className="expand-icon">
                      {expandedRow === transaction.transactionId ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded Message Row */}
                  {expandedRow === transaction.transactionId && (
                    <div className="transaction-detail">
                      <span className="detail-label">📩 M-Pesa Message:</span>
                      <span className="detail-message">{transaction.rawMessage}</span>
                    </div>
                  )}

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