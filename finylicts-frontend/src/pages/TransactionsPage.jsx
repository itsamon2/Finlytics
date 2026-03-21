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

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'income'   && t.type !== 'INCOME')  return false;
    if (filter === 'expenses' && t.type !== 'EXPENSE') return false;
    if (searchTerm &&
        !t.rawMessage?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !t.category?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const summary = {
    totalIncome:       transactions.filter(t => t.type === 'INCOME') .reduce((s, t) => s + t.amount, 0),
    totalExpenses:     transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
    totalTransactions: transactions.length,
  };

  const handleExport = () => {
    const data = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    if (!data.length) { alert('No transactions to export'); return; }
    const csv = [
      ['Date', 'Category', 'Type', 'Amount', 'Message'],
      ...data.map(t => [t.creationDate, t.category, t.type, t.amount, `"${t.rawMessage}"`])
    ].map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), {
      href: url, download: `transactions-${new Date().toISOString().split('T')[0]}.csv`
    }).click();
    URL.revokeObjectURL(url);
    alert(`Successfully exported ${data.length} transactions`);
  };

  const groupedTransactions = filteredTransactions.reduce((groups, t) => {
    const date = t.creationDate;
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));
  sortedDates.forEach(date => {
    groupedTransactions[date].sort((a, b) => b.transactionId - a.transactionId);
  });

  const categoryEmoji = {
    FOOD: '🍔', TRANSPORT: '🚗', UTILITIES: '💡', ENTERTAINMENT: '🎬',
    SHOPPING: '🛍️', HEALTH: '🏥', INCOME: '💰', LOAN: '🏦', OTHER: '📦',
  };

  const isMobile = window.innerWidth <= 768;

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error)   return <div className="error">Error: {error}</div>;

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

      {/* Sticky Summary Cards */}
      <div className="transactions-summary-wrapper">
        <div className="transactions-summary">
          <div className="summary-card">
            <div className="summary-icon income">💰</div>
            <div className="summary-details">
              <span className="summary-label">Total Income</span>
              <span className="summary-value positive">+Ksh {summary.totalIncome.toLocaleString()}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon expenses">📉</div>
            <div className="summary-details">
              <span className="summary-label">Total Expenses</span>
              <span className="summary-value negative">-Ksh {summary.totalExpenses.toLocaleString()}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon pending">🔢</div>
            <div className="summary-details">
              <span className="summary-label">Transactions</span>
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
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by category or message..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <div className="filter-tabs">
            <button className={`filter-tab ${filter === 'all'      ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`filter-tab ${filter === 'income'   ? 'active' : ''}`} onClick={() => setFilter('income')}>Income</button>
            <button className={`filter-tab ${filter === 'expenses' ? 'active' : ''}`} onClick={() => setFilter('expenses')}>Expenses</button>
          </div>
          <select className="date-range" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="this-year">This Year</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-list-container">
        <div className="transactions-list-inner">

        {/* Desktop header — hidden on mobile via CSS */}
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
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>

              {groupedTransactions[date].map(t => (
                <div key={t.transactionId}>

                  {/* ── Desktop row ── */}
                  <div
                    className={`transaction-row ${expandedRow === t.transactionId ? 'expanded' : ''}`}
                    onClick={() => toggleRow(t.transactionId)}
                  >
                    {/* Mobile card layout inside the row */}
                    <span className="transaction-date hide-desktop">
                      {new Date(t.creationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>

                    {/* Mobile: card layout */}
                    <div className="mobile-row">
                      <span className="mobile-date">
                        {new Date(t.creationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="mobile-row-main">
                        <span className={`category-badge category-${t.category?.toLowerCase()}`}>
                          {categoryEmoji[t.category]} {t.category}
                        </span>
                        <span className={`status-badge status-${t.type?.toLowerCase()}`}>{t.type}</span>
                        <span className={`transaction-amount ${t.type === 'INCOME' ? 'positive' : 'negative'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}Ksh {t.amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="mobile-row-arrow">
                        <span className="expand-icon">{expandedRow === t.transactionId ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Desktop: original grid columns */}
                    <span className="desktop-date transaction-date">
                      {new Date(t.creationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="transaction-category desktop-only">
                      <span className={`category-badge category-${t.category?.toLowerCase()}`}>
                        {categoryEmoji[t.category]} {t.category}
                      </span>
                    </span>
                    <span className="transaction-status desktop-only">
                      <span className={`status-badge status-${t.type?.toLowerCase()}`}>{t.type}</span>
                    </span>
                    <span className={`transaction-amount desktop-only ${t.type === 'INCOME' ? 'positive' : 'negative'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}Ksh {t.amount?.toLocaleString()}
                    </span>
                    <span className="expand-icon desktop-only">
                      {expandedRow === t.transactionId ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {expandedRow === t.transactionId && (
                    <div className="transaction-detail">
                      <span className="detail-label">📩 M-Pesa Message:</span>
                      <span className="detail-message">{t.rawMessage}</span>
                    </div>
                  )}

                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="no-transactions"><p>No transactions found</p></div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;