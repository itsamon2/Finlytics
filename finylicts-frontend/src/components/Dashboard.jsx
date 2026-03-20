import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CashflowChart from './CashflowChart';
import ExpenseBreakdown from './ExpenseBreakdown';
import Goals from './Goals';
import Alerts from './Alerts';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7months');
  
  const summary = {
    totalBalance: 24563.00,
    monthlyIncome: 5240.00,
    monthlyExpenses: 3120.00,
    netWorth: 87430.00
  };

  // Get user's first name with fallback
  const firstName = user?.name?.split(' ')[0] || 'Munchkin';

  return (
    <div className="dashboard-container">
      {/* Dashboard Header with Avatar */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Welcome to Finlytics!</h1>
        </div>
        <div className="header-right">
          <NotificationBell count={3} />
          <UserMenu />
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-card">
        <div className="welcome-content">
          <h1>Good morning, {firstName} 👋</h1>
          <p>Here's your financial overview for March 2026</p>
        </div>
        <div className="welcome-stats">
          <div className="welcome-stat">
            <span className="stat-label">Net Worth</span>
            <span className="stat-value">${summary.netWorth.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card balance">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">Total Balance</span>
            <span className="card-value">${summary.totalBalance.toLocaleString()}</span>
            <span className="card-trend positive">+2.5%</span>
          </div>
        </div>
        <div className="summary-card income">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <span className="card-label">Monthly Income</span>
            <span className="card-value">${summary.monthlyIncome.toLocaleString()}</span>
            <span className="card-trend positive">+8.1%</span>
          </div>
        </div>
        <div className="summary-card expenses">
          <div className="card-icon">📉</div>
          <div className="card-content">
            <span className="card-label">Monthly Expenses</span>
            <span className="card-value">${summary.monthlyExpenses.toLocaleString()}</span>
            <span className="card-trend negative">-3.2%</span>
          </div>
        </div>
        <div className="summary-card savings">
          <div className="card-icon">🏦</div>
          <div className="card-content">
            <span className="card-label">Savings Rate</span>
            <span className="card-value">32%</span>
            <span className="card-trend positive">+5.7%</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
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
                <option value="30days">Last 30 days</option>
                <option value="year">This year</option>
              </select>
            </div>
            <CashflowChart timeRange={timeRange} />
          </div>
          
          <div className="alerts-card">
            <div className="card-header">
              <h3>Alerts & Notifications</h3>
              <span className="badge" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
                3 new
              </span>
            </div>
            <Alerts />
          </div>
        </div>

        {/* Right Column */}
        <div className="grid-column">
          <div className="chart-card">
            <div className="card-header">
              <h3>Expense Breakdown</h3>
              <span className="total-expense">Total: $2,860</span>
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

export default Dashboard;