import React, { useState, useEffect } from "react";
import "./ReportsPage.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { transactionService } from "../service/api";

const COLORS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'];

const ReportsPage = () => {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear]   = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const selectedMonthLabel = `${monthNames[currentMonth - 1]} ${currentYear}`;
  const isCurrentMonth     = currentMonth === now.getMonth() + 1 &&
                             currentYear  === now.getFullYear();

  // ── Fetch transactions for selected month ─────────────────────────────────
  const fetchTransactions = () => {
    setLoading(true);
    transactionService.getByMonth(currentMonth, currentYear)
      .then(data => { setTransactions(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentMonth, currentYear]);

  // ── Month navigation ──────────────────────────────────────────────────────
  const changeMonth = (direction) => {
    let m = currentMonth + direction;
    let y = currentYear;
    if (m < 1)  { m = 12; y -= 1; }
    if (m > 12) { m = 1;  y += 1; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  // ── Normalize transactions ────────────────────────────────────────────────
  const normalized = transactions.map(t => ({
    ...t,
    type:   t.type || 'EXPENSE',
    amount: Number(t.amount || 0),
  }));

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalIncome   = normalized
    .filter(t => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = normalized
    .filter(t => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const savingsRate = totalIncome > 0
    ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const totalSaved = totalIncome - totalExpenses;

  // ── Bar chart — group by week within the month ────────────────────────────
  const weeklyData = normalized.reduce((acc, t) => {
    const day  = new Date(t.creationDate).getDate();
    const week = day <= 7  ? 'Week 1'
               : day <= 14 ? 'Week 2'
               : day <= 21 ? 'Week 3'
               :              'Week 4';

    if (!acc[week]) acc[week] = { week, income: 0, expenses: 0, savings: 0 };
    if (t.type === 'INCOME')  acc[week].income   += t.amount;
    else                      acc[week].expenses += t.amount;
    acc[week].savings = acc[week].income - acc[week].expenses;
    return acc;
  }, {});

  const chartData = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w =>
    weeklyData[w] || { week: w, income: 0, expenses: 0, savings: 0 }
  );

  // ── Pie chart — expenses by category ─────────────────────────────────────
  const categoryData = Object.values(
    normalized.reduce((acc, t) => {
      if (t.type === 'EXPENSE' && t.category) {
        acc[t.category] = acc[t.category] || { name: t.category, value: 0 };
        acc[t.category].value += t.amount;
      }
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  // ── Insights ──────────────────────────────────────────────────────────────
  const insights = [];
  const avgExpense = totalExpenses / (categoryData.length || 1);

  categoryData.forEach(cat => {
    if (cat.value > avgExpense * 1.15) {
      insights.push(
        `⚠️ High spending on ${cat.name} — Ksh ${cat.value.toLocaleString()} this month`
      );
    }
  });

  if (savingsRate > 20) insights.push('✅ Great job! Your savings rate is above 20% this month.');
  if (savingsRate < 10 && totalIncome > 0) insights.push('⚠️ Your savings rate is low. Consider reducing expenses.');
  if (totalIncome === 0) insights.push('ℹ️ No income recorded for this month yet.');
  if (totalExpenses === 0 && totalIncome > 0) insights.push('✅ No expenses recorded — all income saved!');

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    const element = document.getElementById('report-content');
    const canvas  = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf     = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Report-${selectedMonthLabel.replace(' ', '-')}.pdf`);
  };

  if (loading) return (
    <div className="loading">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        Loading reports...
      </motion.div>
    </div>
  );

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container" id="report-content">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="subtitle">Financial insights for {selectedMonthLabel}</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={handleExportPDF}>
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Month Navigator ── */}
      <div className="month-navigator">
        <button className="month-nav" onClick={() => changeMonth(-1)}>←</button>
        <span className="current-month">{selectedMonthLabel}</span>
        <button
          className="month-nav"
          onClick={() => changeMonth(1)}
          disabled={isCurrentMonth}
          style={{ opacity: isCurrentMonth ? 0.4 : 1 }}
        >→</button>
      </div>

      {/* ── Empty state ── */}
      {transactions.length === 0 && (
        <div className="no-data-banner">
          No transactions found for {selectedMonthLabel}.
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="summary-grid">
        <motion.div whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="summary-card income">
          <div className="card-content">
            <span className="card-label">Total Income</span>
            <span className="card-value">Ksh {totalIncome.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="summary-card expenses">
          <div className="card-content">
            <span className="card-label">Total Expenses</span>
            <span className="card-value">Ksh {totalExpenses.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} className="summary-card savings">
          <div className="card-content">
            <span className="card-label">Savings Rate</span>
            <span className="card-value">{savingsRate.toFixed(1)}%</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} className="summary-card balance">
          <div className="card-content">
            <span className="card-label">Total Saved</span>
            <span className={`card-value ${totalSaved >= 0 ? 'positive' : 'negative'}`}>
              Ksh {totalSaved.toLocaleString()}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Weekly Bar Chart ── */}
      <div className="chart-card">
        <div className="card-header">
          <h3>Weekly Breakdown — {selectedMonthLabel}</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis dataKey="week" />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `Ksh ${Number(v).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="income"   fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
            <Bar dataKey="savings"  fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Pie Chart ── */}
      {categoryData.length > 0 && (
        <div className="chart-card">
          <div className="card-header">
            <h3>Expenses by Category — {selectedMonthLabel}</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => `Ksh ${Number(v).toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div className="insights">
          <h3>💡 Insights</h3>
          {insights.map((insight, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {insight}
            </motion.p>
          ))}
        </div>
      )}

    </div>
  );
};

export default ReportsPage;