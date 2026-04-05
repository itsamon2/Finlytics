import React, { useState, useEffect } from "react";
import "./ReportsPage.css";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'];

// ✅ Static transaction data
const staticTransactions = [
  { id: 1, amount: 5000, type: "INCOME", category: "Salary", creationDate: "2026-01-10" },
  { id: 2, amount: 1500, type: "EXPENSE", category: "Food", creationDate: "2026-01-12" },
  { id: 3, amount: 2000, type: "EXPENSE", category: "Transport", creationDate: "2026-01-15" },
  { id: 4, amount: 6000, type: "INCOME", category: "Freelance", creationDate: "2026-02-01" },
  { id: 5, amount: 1200, type: "EXPENSE", category: "Entertainment", creationDate: "2026-02-05" },
  { id: 6, amount: 800, type: "EXPENSE", category: "Utilities", creationDate: "2026-02-10" },
  { id: 7, amount: 5500, type: "INCOME", category: "Salary", creationDate: "2026-03-01" },
  { id: 8, amount: 1800, type: "EXPENSE", category: "Food", creationDate: "2026-03-05" },
  { id: 9, amount: 700, type: "EXPENSE", category: "Transport", creationDate: "2026-03-10" },
];

const ReportsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("6months");

  useEffect(() => {
    // ✅ Using static data instead of backend
    setTransactions(staticTransactions);
    setLoading(false);
  }, []);

  const normalizedTransactions = transactions.map(t => ({
    ...t,
    type: t.type || (t.amount > 0 ? "INCOME" : "EXPENSE"),
    creationDate: t.creationDate || new Date().toISOString(),
    amount: Number(t.amount || 0)
  }));

  const filterByRange = (data) => {
    const now = new Date();

    return data.filter(t => {
      const date = new Date(t.creationDate);

      if (range === "3months") {
        const past = new Date();
        past.setMonth(now.getMonth() - 3);
        return date >= past;
      }

      if (range === "6months") {
        const past = new Date();
        past.setMonth(now.getMonth() - 6);
        return date >= past;
      }

      if (range === "year") {
        const past = new Date();
        past.setFullYear(now.getFullYear() - 1);
        return date >= past;
      }

      return true;
    });
  };

  const filtered = filterByRange(normalizedTransactions);

  // Monthly Bar Chart
  const monthly = {};
  filtered.forEach(t => {
    const date = new Date(t.creationDate);
    const key = date.toLocaleString("default", { month: "short", year: "numeric" });
    if (!monthly[key]) monthly[key] = { month: key, income: 0, expenses: 0 };
    if (t.type.toUpperCase() === "INCOME") monthly[key].income += t.amount;
    else monthly[key].expenses += t.amount;
  });

  const chartData = Object.values(monthly)
    .map(m => ({ ...m, savings: m.income - m.expenses }))
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  // Stats
  const totalIncome = filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const months = chartData.length || 1;

  const stats = {
    avgIncome: totalIncome / months,
    avgExpenses: totalExpenses / months,
    savingsRate: totalIncome ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    totalSaved: totalIncome - totalExpenses
  };

  const last = chartData[chartData.length - 1];
  const prev = chartData[chartData.length - 2];

  const incomeTrend = (prev && prev.income !== 0)
    ? ((last?.income - prev.income) / prev.income) * 100
    : 0;

  // Pie Chart: Expense Categories
  const categoryData = Object.values(
    filtered.reduce((acc, t) => {
      if (t.type === "EXPENSE") {
        acc[t.category] = acc[t.category] || { name: t.category, value: 0 };
        acc[t.category].value += t.amount;
      }
      return acc;
    }, {})
  );

  // AI Insights
  const insights = [];
  const avgExpense = totalExpenses / (categoryData.length || 1);

  categoryData.forEach(cat => {
    if (cat.value > avgExpense * 1.15) {
      insights.push(`⚠️ You overspent on ${cat.name} by ${((cat.value - avgExpense)/avgExpense*100).toFixed(1)}%`);
    }
  });

  if (stats.savingsRate > 20) insights.push("✅ Great job! Your savings rate is strong.");
  if (stats.savingsRate < 10) insights.push("⚠️ Your savings rate is low. Consider reducing expenses.");

  // PDF Export
  const handleExportPDF = async () => {
    const element = document.getElementById("report-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Financial_Report.pdf");
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

  return (
    <div className="dashboard-container" id="report-content">
      <div className="dashboard-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="subtitle">Financial insights</p>
        </div>
        <div className="header-actions">
          <select value={range} onChange={e => setRange(e.target.value)}>
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="year">Last 1 year</option>
          </select>
          <button className="export-btn" onClick={handleExportPDF}>Download PDF</button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.4 }} className="summary-card income">
          <div className="card-content">
            <span className="card-label">Avg Income</span>
            <span className="card-value">Ksh {stats.avgIncome.toLocaleString()}</span>
            <motion.span className={`card-trend ${incomeTrend >=0 ? "positive":"negative"}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration:0.5 }}>
              {incomeTrend >=0 ? '▲':'▼'} {Math.abs(incomeTrend.toFixed(1))}%
            </motion.span>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }} className="summary-card expenses">
          <div className="card-content">
            <span className="card-label">Avg Expenses</span>
            <span className="card-value">Ksh {stats.avgExpenses.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.6 }} className="summary-card savings">
          <div className="card-content">
            <span className="card-label">Savings Rate</span>
            <span className="card-value">{stats.savingsRate.toFixed(1)}%</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y:0 }} transition={{ duration: 0.7 }} className="summary-card balance">
          <div className="card-content">
            <span className="card-label">Total Saved</span>
            <span className="card-value">Ksh {stats.totalSaved.toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* BAR CHART */}
      <div className="chart-card">
        <div className="card-header"><h3>Monthly Breakdown</h3></div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" radius={[6,6,0,0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[6,6,0,0]} />
            <Bar dataKey="savings" fill="#3b82f6" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}
      <div className="chart-card">
        <div className="card-header"><h3>Expenses by Category</h3></div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie 
              data={categoryData} 
              dataKey="value" 
              nameKey="name" 
              outerRadius={100} 
              label 
            >
              {categoryData.map((entry,index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value)=>`Ksh ${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* AI INSIGHTS */}
      {insights.length > 0 && (
        <div className="insights">
          <h3>Insights</h3>
          {insights.map((i, idx) => <p key={idx}>{i}</p>)}
        </div>
      )}

    </div>
  );
};

export default ReportsPage;