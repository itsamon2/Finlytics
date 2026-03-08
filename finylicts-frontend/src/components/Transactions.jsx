import React from 'react';

const Transactions = () => {
  // Static transaction data (will be replaced with API later)
  const transactions = [
    { id: 1, amount: -82.50, description: "Grocery Store", category: "Food", date: "Today" },
    { id: 2, amount: 5240.00, description: "Salary Deposit", category: "Income", date: "Mar 1" },
    { id: 3, amount: -15.99, description: "Netflix", category: "Entertainment", date: "Feb 28" },
    { id: 4, amount: -45.20, description: "Gas Station", category: "Transport", date: "Feb 27" },
    { id: 5, amount: 850.00, description: "Freelance Work", category: "Income", date: "Feb 26" }
  ];

  return (
    <div className="transactions">
      <h2>Recent Transactions</h2>
      <div className="transactions-list">
        {transactions.map(t => (
          <div key={t.id} className="transaction-item">
            <span className={`amount ${t.amount > 0 ? 'positive' : 'negative'}`}>
              {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)}
            </span>
            <div className="details">
              <div className="description">{t.description}</div>
              <div className="meta">{t.category} · {t.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;