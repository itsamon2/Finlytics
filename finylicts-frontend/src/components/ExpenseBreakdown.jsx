import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { transactionService } from '../service/api';
import Loader from './Loader';

const COLORS = [
  'var(--accent-color)', 'var(--warning-color)', '#3B82F6',
  '#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#F97316',
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle"
          dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ExpenseBreakdown = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionService.getExpensesByCategory()
      .then(categoryMap => {
        const mapped = Object.entries(categoryMap)
          .map(([name, value], index) => ({
            name,
            value: parseFloat(value),
            color: COLORS[index % COLORS.length],
          }))
          .sort((a, b) => b.value - a.value);
        setData(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) return <Loader fullPage={false} message="Loading breakdown..." />;

  if (data.length === 0) return (
    <div className="no-data">No expenses this month yet.</div>
  );

  return (
    <div className="expense-breakdown">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false}
              label={renderCustomizedLabel} outerRadius={80} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color}
                  stroke="var(--bg-card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`Ksh ${parseFloat(value).toLocaleString()}`, 'Amount']}
              contentStyle={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '8px', color: 'var(--text-primary)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="expense-list">
        {data.map((item, index) => (
          <div key={index} className="expense-item">
            <div className="item-left">
              <span className="color-dot" style={{ backgroundColor: item.color }} />
              <span className="item-name">{item.name}</span>
            </div>
            <div className="item-right">
              <span className="item-amount">Ksh {item.value.toLocaleString()}</span>
              <span className="item-percentage">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;