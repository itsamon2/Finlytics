import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ExpenseBreakdown = () => {
  const data = [
    { name: 'Housing', value: 1200, color: 'var(--accent-color)' },
    { name: 'Food', value: 650, color: 'var(--warning-color)' },
    { name: 'Transport', value: 420, color: '#3B82F6' },
    { name: 'Entertainment', value: 310, color: '#8B5CF6' },
    { name: 'Utilities', value: 280, color: '#EC4899' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="expense-breakdown">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
              contentStyle={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="expense-list">
        {data.map((item, index) => (
          <div key={index} className="expense-item">
            <div className="item-left">
              <span className="color-dot" style={{ backgroundColor: item.color }}></span>
              <span className="item-name">{item.name}</span>
            </div>
            <div className="item-right">
              <span className="item-amount">${item.value.toLocaleString()}</span>
              <span className="item-percentage">{Math.round((item.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;