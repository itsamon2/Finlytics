import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { scenarioService } from '../service/api';
import './ScenariosPage.css';

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

const getWellnessLabel = (score) => {
  if (score >= 80) return { label: 'Excellent 🏆', color: '#10B981' };
  if (score >= 60) return { label: 'Good 👍',      color: '#3B82F6' };
  if (score >= 40) return { label: 'Fair ⚠️',      color: '#F59E0B' };
  return                  { label: 'Poor 🔴',      color: '#EF4444' };
};

const ScenariosPage = () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const [savingsGoal, setSavingsGoal]     = useState('20');
  const [scenarioName, setScenarioName]   = useState('');
  const [results, setResults]             = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [saveLoading, setSaveLoading]     = useState(false);
  const [error, setError]                 = useState(null);
  const [saveSuccess, setSaveSuccess]     = useState(false);

  // ── Fetch saved scenarios on mount ────────────────────────────────────────
  const fetchSavedScenarios = () => {
    scenarioService.getAll()
      .then(data => setSavedScenarios(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSavedScenarios();
  }, []);

  // ── Run scenario ──────────────────────────────────────────────────────────
  const handleCalculate = () => {
    const goal = parseFloat(savingsGoal);
    if (isNaN(goal) || goal < 0 || goal > 100) {
      setError('Please enter a valid savings goal between 0 and 100');
      return;
    }
    setError(null);
    setLoading(true);
    setResults(null);
    setSaveSuccess(false);

    scenarioService.run({ savingsGoalPercent: goal })
      .then(data => { setResults(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  };

  // ── Save scenario ─────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!scenarioName.trim()) {
      setError('Please enter a name for this scenario');
      return;
    }
    setError(null);
    setSaveLoading(true);

    scenarioService.save({
      scenarioName:        scenarioName.trim(),
      savingsGoalPercent:  parseFloat(savingsGoal),
    })
      .then(() => {
        setSaveSuccess(true);
        setScenarioName('');
        fetchSavedScenarios();
        setSaveLoading(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      })
      .catch(err => { setError(err.message); setSaveLoading(false); });
  };

  // ── Delete saved scenario ─────────────────────────────────────────────────
  const handleDelete = (id) => {
    scenarioService.delete(id)
      .then(() => fetchSavedScenarios())
      .catch(() => {});
  };

  // ── Chart data ────────────────────────────────────────────────────────────
  const barData = results ? [
    { name: 'Gross Income', amount: parseFloat(results.grossIncome)     },
    { name: 'Net Income',   amount: parseFloat(results.netIncome)       },
    { name: 'Expenses',     amount: parseFloat(results.monthlyExpenses) },
    { name: 'Savings',      amount: parseFloat(results.monthlySavings)  },
  ] : [];

  const pieData = results ? [
    { name: 'PAYE Tax',  value: parseFloat(results.paye)      },
    { name: 'NHIF',      value: parseFloat(results.nhif)      },
    { name: 'NSSF',      value: parseFloat(results.nssf)      },
    { name: 'Take Home', value: parseFloat(results.netIncome) },
  ] : [];

  const wellness = results ? getWellnessLabel(results.wellnessScore) : null;

  return (
    <div className="scenarios-page">

      {/* ── Header ── */}
      <div className="scenarios-header">
        <div>
          <h1>Financial Scenarios</h1>
          <p className="header-subtitle">
            Simulate your finances based on your actual income and expenses
          </p>
        </div>
      </div>

      {/* ── Input Panel ── */}
      <div className="scenario-input-card">
        <h2>📊 Run a Scenario</h2>
        <p className="scenario-input-note">
          Your actual monthly income and expenses are fetched automatically.
          Just set your savings goal to see the projections.
        </p>
        <div className="scenario-input-grid">
          <div className="scenario-input-group">
            <label>Savings Goal (%)</label>
            <input
              type="number"
              placeholder="e.g. 20"
              min="0"
              max="100"
              value={savingsGoal}
              onChange={e => setSavingsGoal(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="scenario-error">{error}</div>}

        <div className="scenario-actions">
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Scenario'}
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {results && (
        <>
          {/* ── Fetched data notice ── */}
          <div className="scenario-data-notice">
            📅 Based on your current month — Income:
            <strong> Ksh {parseFloat(results.grossIncome).toLocaleString()}</strong>
            &nbsp;· Expenses:
            <strong> Ksh {parseFloat(results.monthlyExpenses).toLocaleString()}</strong>
          </div>

          {/* ── Deductions ── */}
          <div className="scenario-section-title">💰 Income & Deductions</div>
          <div className="scenario-cards-grid">
            <div className="scenario-card">
              <span className="scenario-card-label">Gross Income</span>
              <span className="scenario-card-value">
                Ksh {parseFloat(results.grossIncome).toLocaleString()}
              </span>
            </div>
            <div className="scenario-card deduction">
              <span className="scenario-card-label">PAYE Tax</span>
              <span className="scenario-card-value negative">
                -Ksh {parseFloat(results.paye).toLocaleString()}
              </span>
              <span className="scenario-card-sub">
                {parseFloat(results.deductionRate).toFixed(1)}% effective rate
              </span>
            </div>
            <div className="scenario-card deduction">
              <span className="scenario-card-label">NHIF</span>
              <span className="scenario-card-value negative">
                -Ksh {parseFloat(results.nhif).toLocaleString()}
              </span>
            </div>
            <div className="scenario-card deduction">
              <span className="scenario-card-label">NSSF</span>
              <span className="scenario-card-value negative">
                -Ksh {parseFloat(results.nssf).toLocaleString()}
              </span>
            </div>
            <div className="scenario-card total-deductions">
              <span className="scenario-card-label">Total Deductions</span>
              <span className="scenario-card-value negative">
                -Ksh {parseFloat(results.totalDeductions).toLocaleString()}
              </span>
            </div>
            <div className="scenario-card net">
              <span className="scenario-card-label">Net Income (Take Home)</span>
              <span className="scenario-card-value positive">
                Ksh {parseFloat(results.netIncome).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── Savings Projection ── */}
          <div className="scenario-section-title">📈 Savings Projection</div>
          <div className="scenario-cards-grid">
            <div className="scenario-card">
              <span className="scenario-card-label">Monthly Expenses</span>
              <span className="scenario-card-value negative">
                -Ksh {parseFloat(results.monthlyExpenses).toLocaleString()}
              </span>
            </div>
            <div className="scenario-card savings">
              <span className="scenario-card-label">Monthly Savings</span>
              <span className="scenario-card-value positive">
                Ksh {parseFloat(results.monthlySavings).toLocaleString()}
              </span>
              <span className="scenario-card-sub">
                {parseFloat(results.savingsRate).toFixed(1)}% of net income
              </span>
            </div>
            <div className="scenario-card savings">
              <span className="scenario-card-label">Annual Savings</span>
              <span className="scenario-card-value positive">
                Ksh {parseFloat(results.annualSavings).toLocaleString()}
              </span>
            </div>
            <div className="scenario-card savings">
              <span className="scenario-card-label">5-Year Projection</span>
              <span className="scenario-card-value positive">
                Ksh {parseFloat(results.fiveYearSavings).toLocaleString()}
              </span>
              <span className="scenario-card-sub">At current rate</span>
            </div>
          </div>

          {/* ── Savings Goal ── */}
          <div className="scenario-goal-card">
            <div className="goal-card-header">
              <h3>🎯 Savings Goal — {savingsGoal}% of Net Income</h3>
              <span className={parseFloat(results.savingsGap) <= 0
                ? 'goal-met' : 'goal-missed'}>
                {parseFloat(results.savingsGap) <= 0
                  ? '✅ Goal Met!'
                  : `Gap: Ksh ${Math.round(parseFloat(results.savingsGap)).toLocaleString()}`}
              </span>
            </div>
            <div className="goal-progress-bar">
              <div className="goal-progress-fill" style={{
                width: `${Math.min(
                  (parseFloat(results.monthlySavings) /
                   parseFloat(results.goalAmount)) * 100, 100)}%`,
                backgroundColor: parseFloat(results.savingsGap) <= 0
                  ? '#10B981' : '#F59E0B',
              }} />
            </div>
            <div className="goal-progress-labels">
              <span>Ksh 0</span>
              <span>
                Saving Ksh {parseFloat(results.monthlySavings).toLocaleString()} of
                goal Ksh {Math.round(parseFloat(results.goalAmount)).toLocaleString()}
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
                  <span className={parseFloat(results.savingsRate) >= 20
                    ? 'positive' : 'negative'}>
                    {parseFloat(results.savingsRate).toFixed(1)}%
                  </span>
                </div>
                <div className="wellness-item">
                  <span>Tax Burden</span>
                  <span>{parseFloat(results.deductionRate).toFixed(1)}% of gross</span>
                </div>
                <div className="wellness-item">
                  <span>Expense Ratio</span>
                  <span className={parseFloat(results.expenseRate) <= 60
                    ? 'positive' : 'negative'}>
                    {parseFloat(results.expenseRate).toFixed(1)}% of net
                  </span>
                </div>
              </div>
            </div>
            <div className="wellness-right">
              <div className="wellness-score-circle"
                   style={{ borderColor: wellness.color }}>
                <span className="wellness-score-number"
                      style={{ color: wellness.color }}>
                  {results.wellnessScore}
                </span>
                <span className="wellness-score-max">/100</span>
              </div>
              <span className="wellness-label" style={{ color: wellness.color }}>
                {wellness.label}
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
                    {pieData.map((_, index) => (
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

          {/* ── Recommendations ── */}
          <div className="scenario-tips-card">
            <h3>💡 Recommendations</h3>
            {parseFloat(results.savingsRate) < 10 && (
              <p>⚠️ Your savings rate is below 10%. Try reducing expenses by
                Ksh {Math.round(parseFloat(results.monthlyExpenses) * 0.1)
                  .toLocaleString()} to boost savings.</p>
            )}
            {parseFloat(results.savingsRate) >= 20 && (
              <p>✅ Great savings rate! Consider investing your surplus of
                Ksh {parseFloat(results.monthlySavings).toLocaleString()} per month.</p>
            )}
            {parseFloat(results.expenseRate) > 70 && (
              <p>⚠️ Your expenses take up {parseFloat(results.expenseRate).toFixed(0)}%
                of your net income. Aim to keep this below 70%.</p>
            )}
            {parseFloat(results.savingsGap) > 0 && (
              <p>📌 To meet your {savingsGoal}% savings goal, reduce expenses by
                Ksh {Math.round(parseFloat(results.savingsGap)).toLocaleString()}
                per month.</p>
            )}
            {parseFloat(results.grossIncome) > 100000 && (
              <p>💰 You're in a higher tax bracket. Consider pension contributions
                to reduce your taxable income.</p>
            )}
          </div>

          {/* ── Save Scenario ── */}
          <div className="scenario-save-card">
            <h3>💾 Save This Scenario</h3>
            <p>Give this scenario a name to save it for future reference.</p>
            <div className="scenario-save-row">
              <input
                type="text"
                placeholder="e.g. Current Month, Best Case, Salary Raise..."
                value={scenarioName}
                onChange={e => setScenarioName(e.target.value)}
                className="scenario-name-input"
              />
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : '💾 Save Scenario'}
              </button>
            </div>
            {saveSuccess && (
              <p className="scenario-save-success">✅ Scenario saved successfully!</p>
            )}
          </div>
        </>
      )}

      {/* ── Empty state ── */}
      {!results && !loading && (
        <div className="scenario-empty">
          <p>Set your savings goal above and click Calculate to simulate your finances.</p>
        </div>
      )}

      {/* ── Saved Scenarios ── */}
      {savedScenarios.length > 0 && (
        <div className="saved-scenarios-section">
          <h2>📁 Saved Scenarios</h2>
          <div className="saved-scenarios-grid">
            {savedScenarios.map(s => {
              const w = getWellnessLabel(s.wellnessScore);
              return (
                <div key={s.scenarioId} className="saved-scenario-card">
                  <div className="saved-scenario-header">
                    <h3>{s.scenarioName}</h3>
                    <button className="delete-scenario-btn"
                            onClick={() => handleDelete(s.scenarioId)}>
                      🗑️
                    </button>
                  </div>
                  <div className="saved-scenario-body">
                    <div className="saved-scenario-row">
                      <span>Gross Income</span>
                      <strong>Ksh {parseFloat(s.grossIncome).toLocaleString()}</strong>
                    </div>
                    <div className="saved-scenario-row">
                      <span>Net Income</span>
                      <strong>Ksh {parseFloat(s.netIncome).toLocaleString()}</strong>
                    </div>
                    <div className="saved-scenario-row">
                      <span>Monthly Savings</span>
                      <strong className="positive">
                        Ksh {parseFloat(s.monthlySavings).toLocaleString()}
                      </strong>
                    </div>
                    <div className="saved-scenario-row">
                      <span>Savings Rate</span>
                      <strong>{parseFloat(s.savingsRate).toFixed(1)}%</strong>
                    </div>
                    <div className="saved-scenario-row">
                      <span>Wellness Score</span>
                      <strong style={{ color: w.color }}>{s.wellnessScore}/100 {w.label}</strong>
                    </div>
                  </div>
                  <div className="saved-scenario-footer">
                    <span className="saved-scenario-date">
                      {new Date(s.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default ScenariosPage;