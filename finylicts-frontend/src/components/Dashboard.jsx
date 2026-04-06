import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CashflowChart from './CashflowChart';
import ExpenseBreakdown from './ExpenseBreakdown';
import Goals from './Goals';
import Alerts from './Alerts';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import Loader from './Loader';
import { transactionService } from '../service/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [timeRange, setTimeRange] = useState('7months');

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchSummary = () => {
    transactionService.getSummary()
      .then(data => { setSummary(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const currentMonthYear = new Date().toLocaleString('default', {
    month: 'long', year: 'numeric',
  });

  const formatTrend = (value) => {
    if (value === null || value === undefined) return { label: '—', positive: true };
    const num = parseFloat(value);
    const positive = num >= 0;
    return { label: `${positive ? '+' : ''}${num.toFixed(1)}%`, positive };
  };

  if (loading) return <Loader fullPage={false} message="Loading dashboard..." />;
  if (error)   return <div className="error">Error: {error}</div>;

  const incomeTrend     = formatTrend(summary?.incomeTrend);
  const expenseTrend    = formatTrend(summary?.expenseTrend);
  const balanceTrend    = formatTrend(summary?.balanceTrend);
  const savingsRate     = parseFloat(summary?.savingsRate     || 0).toFixed(1);
  const totalBalance    = parseFloat(summary?.totalBalance    || 0);
  const monthlyIncome   = parseFloat(summary?.monthlyIncome   || 0);
  const monthlyExpenses = parseFloat(summary?.monthlyExpenses || 0);

  return (
    <div className="dashboard-container">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Welcome to Finlytics!</h1>
        </div>
        <div className="header-right">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>

      {/* ── Welcome card ── */}
      <div className="welcome-card">
        <div className="welcome-content">
          <h1>Good {getGreeting()}, {firstName} 👋</h1>
          <p>Here's your financial overview for {currentMonthYear}</p>
        </div>
        <div className="welcome-stats">
          <div className="welcome-stat">
            <span className="stat-label">Total Balance</span>
            <span className="stat-value">
              Ksh {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="summary-grid">
        <div className="summary-card balance">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">Total Balance</span>
            <span className="card-value">
              Ksh {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={`card-trend ${balanceTrend.positive ? 'positive' : 'negative'}`}>
              {balanceTrend.label}
            </span>
          </div>
        </div>

        <div className="summary-card income">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <span className="card-label">Monthly Income</span>
            <span className="card-value">
              Ksh {monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={`card-trend ${incomeTrend.positive ? 'positive' : 'negative'}`}>
              {incomeTrend.label}
            </span>
          </div>
        </div>

        <div className="summary-card expenses">
          <div className="card-icon">📉</div>
          <div className="card-content">
            <span className="card-label">Monthly Expenses</span>
            <span className="card-value">
              Ksh {monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={`card-trend ${expenseTrend.positive ? 'negative' : 'positive'}`}>
              {expenseTrend.label}
            </span>
          </div>
        </div>

        <div className="summary-card savings">
          <div className="card-icon">🏦</div>
          <div className="card-content">
            <span className="card-label">Savings Rate</span>
            <span className="card-value">{savingsRate}%</span>
            <span className={`card-trend ${parseFloat(savingsRate) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(savingsRate) >= 20 ? 'On track 👍' : 'Needs attention'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="dashboard-grid">

        <div className="grid-column">
          <div className="chart-card">
            <div className="card-header">
              <h3>Cashflow Overview</h3>
              <select
                className="chart-period"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7months">Last 7 months</option>
                <option value="12months">Last 12 months</option>
              </select>
            </div>
            <CashflowChart timeRange={timeRange} />
          </div>

          <div className="alerts-card">
            <div className="card-header">
              <h3>Alerts & Notifications</h3>
              <span
                className="badge"
                onClick={() => navigate('/notifications')}
                style={{ cursor: 'pointer' }}
              >
                View all
              </span>
            </div>
            <Alerts />
          </div>
        </div>

        <div className="grid-column">
          <div className="chart-card">
            <div className="card-header">
              <h3>Expense Breakdown</h3>
              <span className="total-expense">
                Total: Ksh {monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <ExpenseBreakdown />
          </div>

          <div className="goals-card">
            <div className="card-header">
              <h3>Goal Progress</h3>
              <button className="view-all" onClick={() => navigate('/goals')}>View All →</button>
            </div>
            <Goals />
          </div>
        </div>

      </div>
    </div>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;