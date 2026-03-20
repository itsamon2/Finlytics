import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Goals.styles.css';
import { goalsService } from '../service/api';

// ── Simple markdown-like renderer for the AI sections ──────────────────────
const renderReport = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return (
        <h3 key={i} className="report-section-title">
          {line.replace('## ', '')}
        </h3>
      );
    }
    if (line.startsWith('* ') || line.startsWith('- ')) {
      return (
        <li key={i} className="report-bullet">
          {line.replace(/^[*-] /, '')}
        </li>
      );
    }
    if (/^\d+\./.test(line)) {
      return (
        <li key={i} className="report-numbered">
          {line}
        </li>
      );
    }
    if (line.trim() === '') {
      return <div key={i} className="report-spacer" />;
    }
    return <p key={i} className="report-paragraph">{line}</p>;
  });
};

const AdvisoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal]             = useState(null);
  const [report, setReport]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState(null);

  // ─── Load goal details ─────────────────────────────────────────────────────
  useEffect(() => {
    goalsService.getById(id)
      .then(data => { setGoal(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, [id]);

  // ─── Generate advisory report ──────────────────────────────────────────────
  const generateReport = () => {
    setGenerating(true);
    setReport('');
    goalsService.getAdvisory(id)
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
          <h1>💡 Advisory Plan</h1>
          <p className="header-subtitle">{goal?.goalName}</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/goals/${id}/feasibility`)}
          >
            📊 View Feasibility
          </button>
          <button
            className="btn btn-primary"
            onClick={generateReport}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '💡 Get Advisory'}
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
              <span>Monthly Contribution</span>
              <strong>Ksh {parseFloat(goal.contributionAmount || 0).toLocaleString()}</strong>
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

      {/* ── Empty state ── */}
      {!report && !generating && (
        <div className="report-empty">
          <div className="report-empty-icon">💡</div>
          <h3>No advisory plan yet</h3>
          <p>Click <strong>Get Advisory</strong> to receive a personalised action plan on how to achieve this goal based on your spending patterns.</p>
          <button className="btn btn-primary" onClick={generateReport}>
            💡 Get Advisory
          </button>
        </div>
      )}

      {/* ── Generating state ── */}
      {generating && (
        <div className="report-generating">
          <div className="generating-spinner">⏳</div>
          <p>Building your personalised action plan...</p>
          <p className="generating-sub">This usually takes 5–10 seconds</p>
        </div>
      )}

      {/* ── Report output ── */}
      {report && !generating && (
        <div className="report-card advisory-report">
          <div className="report-header">
            <h2>💡 Your Action Plan</h2>
            <span className="report-timestamp">
              Generated {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="report-body">
            {renderReport(report)}
          </div>
          <div className="report-footer">
            <button className="btn btn-secondary" onClick={generateReport}>
              🔄 Refresh Plan
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/goals/${id}/feasibility`)}
            >
              📊 Check Feasibility →
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdvisoryPage;