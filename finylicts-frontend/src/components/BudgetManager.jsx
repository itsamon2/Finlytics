import React from 'react';

const BudgetManager = () => {
  // Static budget data (will be replaced with API later)
  const budgets = [
    { category: "Housing", spent: 1200, budget: 1500 },
    { category: "Food", spent: 650, budget: 800 },
    { category: "Transport", spent: 420, budget: 500 },
    { category: "Entertainment", spent: 310, budget: 400 }
  ];

  return (
    <div className="budget-manager">
      <h2>Budget Manager</h2>
      <div className="budget-list">
        {budgets.map((b, index) => (
          <div key={index} className="budget-item">
            <div className="budget-header">
              <span className="category">{b.category}</span>
              <span className="spent">${b.spent} / ${b.budget}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(b.spent / b.budget) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetManager;