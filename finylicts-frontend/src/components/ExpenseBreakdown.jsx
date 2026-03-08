import React from 'react';

const ExpenseBreakdown = () => {
  const expenses = [
    { category: "Housing", amount: 1200, color: "#2DD4BF", percentage: 48 },
    { category: "Food", amount: 650, color: "#F59E0B", percentage: 26 },
    { category: "Transport", amount: 420, color: "#3B82F6", percentage: 17 },
    { category: "Entertainment", amount: 310, color: "#8B5CF6", percentage: 9 }
  ];

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Calculate angles for pie chart (conic-gradient)
  let cumulativePercentage = 0;
  const gradientStops = expenses.map(expense => {
    const start = cumulativePercentage;
    cumulativePercentage += expense.percentage;
    return `${expense.color} ${start}% ${cumulativePercentage}%`;
  }).join(', ');

  return (
    <div className="expense-breakdown">
      <div className="pie-chart-container">
        <div 
          className="pie-chart"
          style={{
            background: `conic-gradient(${gradientStops})`
          }}
        >
          <div className="pie-inner-circle">
            <span className="pie-total">${total.toLocaleString()}</span>
            <span className="pie-label">Total</span>
          </div>
        </div>
      </div>

      <div className="expense-legend">
        {expenses.map((expense, index) => (
          <div key={index} className="legend-item">
            <div className="legend-left">
              <span className="legend-dot" style={{ backgroundColor: expense.color }}></span>
              <span className="legend-category">{expense.category}</span>
            </div>
            <div className="legend-right">
              <span className="legend-amount">${expense.amount.toLocaleString()}</span>
              <span className="legend-percentage">{expense.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;