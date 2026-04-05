import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { transactionService } from '../service/api';
import Loader from './Loader';

const CashflowChart = ({ timeRange = '7months' }) => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionService.getCashflow()
      .then(data => { setRawData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const data = useMemo(() => {
    const limit = timeRange === '12months' ? 12 : 7;
    return rawData.slice(-limit);
  }, [rawData, timeRange]);

  const formatYAxis = (value) => {
    if (value >= 1000) return `Ksh ${(value / 1000).toFixed(0)}k`;
    return `Ksh ${value}`;
  };

  const avgIncome   = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + parseFloat(d.income   || 0), 0) / data.length) : 0;
  const avgExpenses = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + parseFloat(d.expenses || 0), 0) / data.length) : 0;

  if (loading) return <Loader fullPage={false} message="Loading chart..." />;

  if (data.length === 0) return (
    <div className="no-data">No cashflow data yet.</div>
  );

  return (
    <div className="cashflow-chart">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--accent-color)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--danger-color)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--danger-color)" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="month" stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
            <YAxis tickFormatter={formatYAxis} stroke="var(--text-tertiary)"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`Ksh ${parseFloat(value).toLocaleString()}`, '']}
              contentStyle={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '8px', color: 'var(--text-primary)',
              }}
            />
            <Area type="monotone" dataKey="income" stroke="var(--accent-color)"
              strokeWidth={2} fill="url(#incomeGradient)"
              dot={{ fill: 'var(--accent-color)', r: 4 }} />
            <Area type="monotone" dataKey="expenses" stroke="var(--danger-color)"
              strokeWidth={2} fill="url(#expensesGradient)"
              dot={{ fill: 'var(--danger-color)', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Avg. Income</span>
          <span className="stat-value positive">Ksh {avgIncome.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg. Expenses</span>
          <span className="stat-value negative">Ksh {avgExpenses.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CashflowChart;