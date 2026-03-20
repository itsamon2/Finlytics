import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CashflowChart = ({ timeRange = '7months' }) => {
  // Generate data based on selected time range
  const getData = () => {
    switch(timeRange) {
      case '30days':
        return [
          { month: 'Week 1', income: 5200, expenses: 3800 },
          { month: 'Week 2', income: 5300, expenses: 4100 },
          { month: 'Week 3', income: 5100, expenses: 4300 },
          { month: 'Week 4', income: 5400, expenses: 3900 },
        ];
      case 'year':
        return [
          { month: 'Jan', income: 5200, expenses: 3800 },
          { month: 'Feb', income: 5300, expenses: 4100 },
          { month: 'Mar', income: 5100, expenses: 4300 },
          { month: 'Apr', income: 5400, expenses: 3900 },
          { month: 'May', income: 5600, expenses: 4200 },
          { month: 'Jun', income: 5800, expenses: 4500 },
          { month: 'Jul', income: 5500, expenses: 4000 },
          { month: 'Aug', income: 5700, expenses: 4300 },
          { month: 'Sep', income: 5900, expenses: 4600 },
          { month: 'Oct', income: 6100, expenses: 4800 },
          { month: 'Nov', income: 6300, expenses: 5000 },
          { month: 'Dec', income: 6500, expenses: 5200 },
        ];
      default: // 7months
        return [
          { month: 'Jul', income: 5200, expenses: 3800 },
          { month: 'Aug', income: 5300, expenses: 4100 },
          { month: 'Sep', income: 5100, expenses: 4300 },
          { month: 'Oct', income: 5400, expenses: 3900 },
          { month: 'Nov', income: 5600, expenses: 4200 },
          { month: 'Dec', income: 5800, expenses: 4500 },
          { month: 'Jan', income: 5500, expenses: 4000 },
        ];
    }
  };

  const data = useMemo(() => getData(), [timeRange]);

  const formatYAxis = (value) => {
    if (value >= 1000) return `$${value/1000}k`;
    return `$${value}`;
  };

  // Calculate averages based on current data
  const avgIncome = Math.round(data.reduce((sum, item) => sum + item.income, 0) / data.length);
  const avgExpenses = Math.round(data.reduce((sum, item) => sum + item.expenses, 0) / data.length);

  return (
    <div className="cashflow-chart">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--danger-color)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--danger-color)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
            
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="var(--accent-color)" 
              strokeWidth={2}
              fill="url(#incomeGradient)"
              dot={{ fill: 'var(--accent-color)', r: 4 }}
            />
            
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stroke="var(--danger-color)" 
              strokeWidth={2}
              fill="url(#expensesGradient)"
              dot={{ fill: 'var(--danger-color)', r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Avg. Income</span>
          <span className="stat-value positive">
            ${avgIncome.toLocaleString()}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg. Expenses</span>
          <span className="stat-value negative">
            ${avgExpenses.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CashflowChart;