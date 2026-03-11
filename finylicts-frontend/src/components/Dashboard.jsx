import React from 'react';
import Transactions from './Transactions';
import ExpenseBreakdown from './ExpenseBreakdown';
import Goals from './Goals';
import Alerts from './Alerts';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h1>Good morning, Munchkin 👋</h1>
        <p>Here's your financial overview for March 2026</p>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Balance</h3>
          <div className="amount">$24,563.00</div>
          <span className="trend positive">+2.5%</span>
        </div>
        <div className="card">
          <h3>Monthly Income</h3>
          <div className="amount">$5,240.00</div>
          <span className="trend positive">+8.1%</span>
        </div>
        <div className="card">
          <h3>Monthly Expenses</h3>
          <div className="amount">$3,120.00</div>
          <span className="trend negative">-3.2%</span>
        </div>
        <div className="card">
          <h3>Net Worth</h3>
          <div className="amount">$87,430.00</div>
          <span className="trend positive">+5.7%</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="left-column">
          <div className="section">
            <h2>Cashflow Overview</h2>
            <div className="chart-placeholder">
              <div className="chart-axis">
                <span>$6k</span>
                <span>$5k</span>
                <span>$3k</span>
                <span>$2k</span>
                <span>$0k</span>
              </div>
              <div className="chart-bars">
                <div className="chart-note">Chart coming soon</div>
              </div>
              <div className="chart-x-axis">
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
              </div>
            </div>
          </div>
          
          <div className="section">
            <h2>Recent Transactions</h2>
            <Transactions />
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="section">
            <h2>Expense Breakdown</h2>
            <ExpenseBreakdown />
          </div>
          
          <div className="section">
            <h2>Goal Progress</h2>
            <Goals />
          </div>
          
          <div className="section">
            <h2>Alerts & Notifications</h2>
            <Alerts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;