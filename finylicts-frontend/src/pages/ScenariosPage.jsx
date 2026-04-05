import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './ScenariosPage.css';

// ── Kenyan PAYE Tax Brackets (monthly) ───────────────────────────────────────
const calculatePAYE = (monthlyGross) => {
  const annual = monthlyGross * 12;
  let tax = 0;

  if (annual <= 288000) {
    tax = annual * 0.10;
  } else if (annual <= 387996) {
    tax = 28800 + (annual - 288000) * 0.25;
  } else if (annual <= 6000000) {
    tax = 28800 + 24999 + (annual - 387996) * 0.30;
  } else if (annual <= 9600000) {
    tax = 28800 + 24999 + 1683601 * 0.30 + (annual - 6000000) * 0.325;
  } else {
    tax = 28800 + 24999 + 1683601 * 0.30 + 1170000 * 0.325 + (annual - 9600000) * 0.35;
  }

  // Personal relief — Ksh 2,400/month
  const monthlyTax = Math.max(0, (tax / 12) - 2400);
  return Math.round(monthlyTax);
};

// ── NHIF Deduction (monthly income bracket) ──────────────────────────────────
const calculateNHIF = (monthlyGross) => {
  if (monthlyGross < 6000)   return 150;
  if (monthlyGross < 8000)   return 300;
  if (monthlyGross < 12000)  return 400;
  if (monthlyGross < 15000)  return 500;
  if (monthlyGross < 20000)  return 600;
  if (monthlyGross < 25000)  return 750;
  if (monthlyGross < 30000)  return 850;
  if (monthlyGross < 35000)  return 900;
  if (monthlyGross < 40000)  return 950;
  if (monthlyGross < 45000)  return 1000;
  if (monthlyGross < 50000)  return 1100;
  if (monthlyGross < 60000)  return 1200;
  if (monthlyGross < 70000)  return 1300;
  if (monthlyGross < 80000)  return 1400;
  if (monthlyGross < 90000)  return 1500;
  if (monthlyGross < 100000) return 1600;
  return 1700;
};

// ── NSSF (fixed Tier I + II) ──────────────────────────────────────────────────
const NSSF = 1080;

// ── Wellness score ────────────────────────────────────────────────────────────
const getWellnessScore = (savingsRate, deductionRate, expenseRate) => {
  let score = 0;

  // Savings rate — max 50 points
  if (savingsRate >= 30)      score += 50;
  else if (savingsRate >= 20) score += 40;
  else if (savingsRate >= 10) score += 25;
  else if (savingsRate >= 5)  score += 10;

  // Deduction rate — max 20 points (lower is better)
  if (deductionRate <= 15)      score += 20;
  else if (deductionRate <= 25) score += 15;
  else if (deductionRate <= 35) score += 8;

  // Expense ratio — max 30 points (lower is better)
  if (expenseRate <= 40)      score += 30;
  else if (expenseRate <= 55) score += 20;
  else if (expenseRate <= 70) score += 10;

  return Math.min(score, 100);
};

const getWellnessLabel = (score) => {
  if (score >= 80) return { label: 'Excellent 🏆', color: '#10B981' };
  if (score >= 60) return { label: 'Good 👍',      color: '#3B82F6' };
  if (score >= 40) return { label: 'Fair ⚠️',      color: '#F59E0B' };
  return                  { label: 'Poor 🔴',      color: '#EF4444' };
};

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

const ScenariosPage = () => {
  const [income, setIncome]         = useState('');
  const [expenses, setExpenses]     = useState('');
  const [savingsGoal, setSavingsGoal] = useState('20');
  const [calculated, setCalculated] = useState(false);

  // ── Core calculations ─────────────────────────────────────────────────────
  const results = useMemo(() => {
    const gross    = parseFloat(income)    || 0;
    const exp      = parseFloat(expenses)  || 0;
    const goalPct  = parseFloat(savingsGoal) || 0;

    if (gross <= 0) return null;

    const paye  = calculatePAYE(gross);
    const nhif  = calculateNHIF(gross);
    const nssf  = NSSF;
    const totalDeductions = paye + nhif + nssf;
    const netIncome       = gross - totalDeductions;
    const monthlySavings  = netIncome - exp;
    const savingsRate     = netIncome > 0
      ? Math.max(0, (monthlySavings / netIncome) * 100) : 0;
    const goalAmount      = netIncome * (goalPct / 100);
    const savingsGap      = goalAmount - monthlySavings;

    const deductionRate = (totalDeductions / gross) * 100;
    const expenseRate   = netIncome > 0 ? (exp / netIncome) * 100 : 100;
    const wellnessScore = getWellnessScore(savingsRate, deductionRate, expenseRate);
    const wellness      = getWellnessLabel(wellnessScore);

    return {
      gross, exp, paye, nhif, nssf,
      totalDeductions, netIncome,
      monthlySavings: Math.max(0, monthlySavings),
      annualSavings:  Math.max(0, monthlySavings * 12),
      fiveYearSavings: Math.max(0, monthlySavings * 60),
      savingsRate:    Math.max(0, savingsRate),
      goalAmount, savingsGap,
      wellnessScore, wellness,
      deductionRate, expenseRate,
    };
  }, [income, expenses, savingsGoal]);

  // ── Chart data ────────────────────────────────────────────────────────────
  const barData = results ? [
    { name: 'Gross Income', amount: results.gross },
    { name: 'Net Income',   amount: results.netIncome },
    { name: 'Expenses',     amount: results.exp },
    { name: 'Savings',      amount: results.monthlySavings },
  ] : [];

  const pieData = results ? [
    { name: 'PAYE Tax',  value: results.paye  },
    { name: 'NHIF',      value: results.nhif  },
    { name: 'NSSF',      value: results.nssf  },
    { name: 'Take Home', value: results.netIncome },
  ] : [];

  const handleCalculate = () => {
    if (!income || parseFloat(income) <= 0) {
      alert('Please enter a valid monthly income');
      return;
    }
    setCalculated(true);
  };

  const handleReset = () => {
    setIncome('');
    setExpenses('');
    setSavingsGoal('20');
    setCalculated(false);
  };

  return (
    <div className="scenarios-page">

      {/* ── Header ── */}
      <div className="scenarios-header">
        <div>
          <h1>Financial Scenarios</h1>
          <p className="header-subtitle">
            Simulate your finances and project your savings
          </p>
        </div>
      </div>

      {/* ── Input Panel ── */}
      <div className="scenario-input-card">
        <h2>📊 Enter Your Scenario</h2>
        <div className="scenario-input-grid">
          <div className="scenario-input-group">
            <label>Monthly Gross Income (Ksh)</label>
            <input
              type="number"
              placeholder="e.g. 80000"
              value={income}
              onChange={e => { setIncome(e.target.value); setCalculated(false); }}
            />
          </div>
          <div className="scenario-input-group">
            <label>Monthly Expenses (Ksh)</label>
            <input
              type="number"
              placeholder="e.g. 35000"
              value={expenses}
              onChange={e => { setExpenses(e.target.value); setCalculated(false); }}
            />
          </div>
          <div className="scenario-input-group">
            <label>Savings Goal (%)</label>
            <input
              type="number"
              placeholder="e.g. 20"
              min="0"
              max="100"
              value={savingsGoal}
              onChange={e => { setSavingsGoal(e.target.value); setCalculated(false); }}
            />
          </div>
        </div>
        <div className="scenario-actions">
          <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
          <button className="btn btn-primary" onClick={handleCalculate}>
            Calculate Scenario
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {calculated && results && (
        <>
          {/* ── Deductions Card ── */}
          <div className="scenario-section-title">💰 Income & Deductions</div>
          <div className="scenario-cards-grid">
            <div className="scenario-card">
              <span className="scenario-card-label">Gross Income</span>
              <span className="scenario-card-value">
                Ksh {results.gross.toLocaleString()}
              </span>
            </div>
            <div className="scenario-card deduction">
              <span className="scenario-card-label">PAYE Tax</span>
              <span className="scenario-card-value negative">
                -Ksh {results.paye.toLocaleString()}
              </span>
              <span className="scenario-card-sub">
                {results.deductionRate.toFixed(1)}% effective rate
              </span>
            </div>
            <div className="scenario-card deduction">
              <span className="scenario-card-label">NHIF</span>
              <span className="scenario-card-value negative">
                -Ksh {results.nhif.toLocaleString()}
              </span>
            </div>
            <div className="scenario-card deduction">
              <span className="scenario-card-label">NSSF</span>
              <span className="scenario-card-value negative">
                -Ksh {results.nssf.toLocaleString()}
              </span>
            </div>
            <div className="scenario-card total-deductions">
              <span className="scenario-card-label">Total Deductions</span>
              <span className="scenario-card-value negative">
                -Ksh {results.totalDeductions.toLocaleString()}
              </span>
            </div>
            <div className="scenario-card net">
              <span className="scenario-card-label">Net Income (Take Home)</span>
              <span className="scenario-card-value positive">
                Ksh {results.netIncome.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── Savings Projection ── */}
          <div className="scenario-section-title">📈 Savings Projection</div>
          <div className="scenario-cards-grid">
            <div className="scenario-card">
              <span className="scenario-card-label">Monthly Expenses</span>
              <span className="scenario-card-value negative">
                -Ksh {results.exp.toLocaleString()}
              </span>
            </div>
            <div className="scenario-card savings">
              <span className="scenario-card-label">Monthly Savings</span>
              <span className="scenario-card-value positive">
                Ksh {results.monthlySavings.toLocaleString()}
              </span>
              <span className="scenario-card-sub">
                {results.savingsRate.toFixed(1)}% of net income
              </span>
            </div>
            <div className="scenario-card savings">
              <span className="scenario-card-label">Annual Savings</span>
              <span className="scenario-card-value positive">
                Ksh {results.annualSavings.toLocaleString()}
              </span>
            </div>
            <div className="scenario-card savings">
              <span className="scenario-card-label">5-Year Projection</span>
              <span className="scenario-card-value positive">
                Ksh {results.fiveYearSavings.toLocaleString()}
              </span>
              <span className="scenario-card-sub">At current rate</span>
            </div>
          </div>

          {/* ── Savings Goal Tracker ── */}
          <div className="scenario-goal-card">
            <div className="goal-card-header">
              <h3>🎯 Savings Goal — {savingsGoal}% of Net Income</h3>
              <span className={results.savingsGap <= 0 ? 'goal-met' : 'goal-missed'}>
                {results.savingsGap <= 0 ? '✅ Goal Met!' : `Gap: Ksh ${Math.round(results.savingsGap).toLocaleString()}`}
              </span>
            </div>
            <div className="goal-progress-bar">
              <div
                className="goal-progress-fill"
                style={{
                  width: `${Math.min((results.monthlySavings / results.goalAmount) * 100, 100)}%`,
                  backgroundColor: results.savingsGap <= 0 ? '#10B981' : '#F59E0B',
                }}
              />
            </div>
            <div className="goal-progress-labels">
              <span>Ksh 0</span>
              <span>
                Saving Ksh {results.monthlySavings.toLocaleString()} of
                goal Ksh {Math.round(results.goalAmount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── Wellness Score ── */}
          <div className="scenario-wellness-card">
            <div className="wellness-left">
              <h3>🏥 Financial Wellness Score</h3>
              <p className="wellness-description">
                Based on your savings rate, tax burden and expense ratio
              </p>
              <div className="wellness-breakdown">
                <div className="wellness-item">
                  <span>Savings Rate</span>
                  <span className={results.savingsRate >= 20 ? 'positive' : 'negative'}>
                    {results.savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="wellness-item">
                  <span>Tax Burden</span>
                  <span>{results.deductionRate.toFixed(1)}% of gross</span>
                </div>
                <div className="wellness-item">
                  <span>Expense Ratio</span>
                  <span className={results.expenseRate <= 60 ? 'positive' : 'negative'}>
                    {results.expenseRate.toFixed(1)}% of net
                  </span>
                </div>
              </div>
            </div>
            <div className="wellness-right">
              <div className="wellness-score-circle"
                   style={{ borderColor: results.wellness.color }}>
                <span className="wellness-score-number"
                      style={{ color: results.wellness.color }}>
                  {results.wellnessScore}
                </span>
                <span className="wellness-score-max">/100</span>
              </div>
              <span className="wellness-label"
                    style={{ color: results.wellness.color }}>
                {results.wellness.label}
              </span>
            </div>
          </div>

          {/* ── Charts ── */}
          <div className="scenario-charts-grid">
            <div className="scenario-chart-card">
              <h3>Income Breakdown</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <XAxis dataKey="name"
                         tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`}
                         tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip formatter={v => `Ksh ${Number(v).toLocaleString()}`}
                           contentStyle={{
                             background: 'var(--bg-card)',
                             border: '1px solid var(--border-color)',
                             borderRadius: '8px',
                             color: 'var(--text-primary)',
                           }} />
                  <Bar dataKey="amount" fill="var(--accent-color)"
                       radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="scenario-chart-card">
              <h3>Deductions vs Take Home</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name"
                       outerRadius={90}
                       label={({ name, percent }) =>
                         `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `Ksh ${Number(v).toLocaleString()}`}
                           contentStyle={{
                             background: 'var(--bg-card)',
                             border: '1px solid var(--border-color)',
                             borderRadius: '8px',
                             color: 'var(--text-primary)',
                           }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Tips ── */}
          <div className="scenario-tips-card">
            <h3>💡 Recommendations</h3>
            {results.savingsRate < 10 && (
              <p>⚠️ Your savings rate is below 10%. Try reducing expenses by
                Ksh {Math.round(results.exp * 0.1).toLocaleString()} to boost savings.</p>
            )}
            {results.savingsRate >= 20 && (
              <p>✅ Great savings rate! Consider investing your surplus of
                Ksh {results.monthlySavings.toLocaleString()} per month.</p>
            )}
            {results.expenseRate > 70 && (
              <p>⚠️ Your expenses take up {results.expenseRate.toFixed(0)}% of your
                net income. Aim to keep this below 70%.</p>
            )}
            {results.savingsGap > 0 && (
              <p>📌 To meet your {savingsGoal}% savings goal, reduce expenses by
                Ksh {Math.round(results.savingsGap).toLocaleString()} per month.</p>
            )}
            {results.paye > 0 && results.gross > 100000 && (
              <p>💰 You're in a higher tax bracket. Consider pension contributions
                to reduce your taxable income.</p>
            )}
          </div>
        </>
      )}

      {/* ── Empty state ── */}
      {!calculated && (
        <div className="scenario-empty">
          <p>Enter your monthly income and expenses above to simulate your financial scenario.</p>
        </div>
      )}

    </div>
  );
};

export default ScenariosPage;