import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Goals.styles.css';
import { goalsService } from '../service/api';

// ── Simple markdown-like renderer for the AI sections ──────────────────────
const renderReport = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    // Section headers like ## 📊 Where You Stand
    if (line.startsWith('## ')) {
      return (
        <h3 key={i} className="report-section-title">
          {line.replace('## ', '')}
        </h3>
      );
    }
    // Bullet points
    if (line.startsWith('* ') || line.startsWith('- ')) {
      return (
        <li key={i} className="report-bullet">
          {line.replace(/^[*-] /, '')}
        </li>
      );
    }
    // Numbered steps
    if (/^\d+\./.test(line)) {
      return (
        <li key={i} className="report-numbered">
          {line}
        </li>
      );
    }
    // Empty line → spacer
    if (line.trim() === '') {
      return <div key={i} className="report-spacer" />;
    }
    // Normal paragraph
    return <p key={i} className="report-paragraph">{line}</p>;
  });
};

const FeasibilityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal]         = useState(null);
  const [report, setReport]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]       = useState(null);

  // ─── Load goal details ─────────────────────────────────────────────────────
  useEffect(() => {
    goalsService.getById(id)
      .then(data => { setGoal(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, [id]);

  // ─── Generate feasibility report ──────────────────────────────────────────
  const generateReport = () => {
    setGenerating(true);
    setReport('');
    goalsService.getFeasibility(id)
      .then(data => { setReport(data); setGenerating(false); })
      .catch(err  => { setError(err.message); setGenerating(false); });
  };

  // ─── Progress helpers ──────────────────────────────────────────────────────
  const getProgress = () => {
    if (!goal) return 0;
    const target = parseFloat(goal.targetAmount);
    const saved  = parseFloat(goal.savedAmount || 0);
    return target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  };

  const priorityColor = { HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#10B981' };
  const accentColor   = goal ? (priorityColor[goal.priority] || '#3B82F6') : '#3B82F6';

  if (loading) return <div className="loading">Loading goal...</div>;
  if (error)   return <div className="error">Error: {error}</div>;

  return (
    <div className="goals-page">

      {/* ── Back nav ── */}
      <button className="back-btn" onClick={() => navigate('/goals')}>
        ← Back to Goals
      </button>

      {/* ── Header ── */}
      <div className="goals-header">
        <div>
          <h1>📊 Feasibility Report</h1>
          <p className="header-subtitle">{goal?.goalName}</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/goals/${id}/advisory`)}
          >
            💡 View Advisory
          </button>
          <button
            className="btn btn-primary"
            onClick={generateReport}
            disabled={generating}
          >
            {generating ? '⏳ Analysing...' : '📊 Run Feasibility'}
          </button>
        </div>
      </div>

      {/* ── Goal snapshot card ── */}
      {goal && (
        <div className="budget-card good goal-snapshot">
          <div className="card-header">
            <div className="category-info">
              <div className="category-icon" style={{ backgroundColor: `${accentColor}15` }}>
                <span style={{ color: accentColor }}>🎯</span>
              </div>
              <div>
                <h3>{goal.goalName}</h3>
                <span className="budget-trend">{goal.goalType} · {goal.priority} priority</span>
              </div>
            </div>
            <span
              className="goal-badge"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {goal.status}
            </span>
          </div>

          <div className="budget-details">
            <div className="amount-row">
              <span>Target</span>
              <strong>Ksh {parseFloat(goal.targetAmount).toLocaleString()}</strong>
            </div>
            <div className="amount-row">
              <span>Saved</span>
              <strong>Ksh {parseFloat(goal.savedAmount || 0).toLocaleString()}</strong>
            </div>
            <div className="amount-row">
              <span>Target Date</span>
              <strong>{goal.targetDate}</strong>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Savings Progress</span>
              <span style={{ color: accentColor }}>{Math.round(getProgress())}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${getProgress()}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state — no report yet ── */}
      {!report && !generating && (
        <div className="report-empty">
          <div className="report-empty-icon">📊</div>
          <h3>No feasibility report yet</h3>
          <p>Click <strong>Run Feasibility</strong> to analyse whether this goal is achievable based on your current finances.</p>
          <button className="btn btn-primary" onClick={generateReport}>
            📊 Run Feasibility
          </button>
        </div>
      )}

      {/* ── Generating skeleton ── */}
      {generating && (
        <div className="report-generating">
          <div className="generating-spinner">⏳</div>
          <p>Analysing your finances and goal data...</p>
          <p className="generating-sub">This usually takes 5–10 seconds</p>
        </div>
      )}

      {/* ── Report output ── */}
      {report && !generating && (
        <div className="report-card feasibility-report">
          <div className="report-header">
            <h2>📊 Feasibility Analysis</h2>
            <span className="report-timestamp">
              Generated {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="report-body">
            {renderReport(report)}
          </div>
          <div className="report-footer">
            <button className="btn btn-secondary" onClick={generateReport}>
              🔄 Refresh Report
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/goals/${id}/advisory`)}
            >
              💡 Get Advisory Plan →
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeasibilityPage;