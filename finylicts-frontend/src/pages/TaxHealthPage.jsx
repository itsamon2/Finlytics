import { FaWallet, FaShieldAlt, FaHeart, FaChartLine } from "react-icons/fa";
import "./TaxHealthPage.css";

const HealthScoreCard = ({ score = 0, description = "No data available" }) => (
  <div className="health-score-card">
    <p className="label">Financial Health Score</p>
    <div className="score">{score}</div>
    <p className="description">{description}</p>
  </div>
);

const MetricCard = ({ title, value = 0, target = 100, icon, warning }) => {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div className={`metric-card ${warning ? "warning" : ""}`}>
      <div className="metric-header">
        <div className="icon">{icon}</div>
        <div>
          <h4>{title}</h4>
          <h2>{value}%</h2>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <p className="target">Target: {target}%</p>
    </div>
  );
};

const TaxSummary = ({ summary = {} }) => (
  <div className="tax-summary">
    <h3>Estimated Tax Summary (2026)</h3>
    <div className="summary-container">
      {[
        { label: "Gross Income",     value: summary.grossIncome  },
        { label: "Total Deductions", value: summary.deductions   },
        { label: "Estimated Tax",    value: summary.estimatedTax },
        { label: "After Tax",        value: summary.afterTax     },
      ].map(({ label, value }) => (
        <div key={label} className="summary-card">
          <p>{label}</p>
          <h2>{`KSh ${(value ?? 0).toLocaleString()}`}</h2>
        </div>
      ))}
    </div>
  </div>
);

const FALLBACK = {
  score: 82,
  description: "Excellent financial stability",
  metrics: { savingsRate: 40, debtToIncome: 22, emergencyFund: 57, investmentGrowth: 8.2 },
  taxSummary: { grossIncome: 120000, deductions: 35000, estimatedTax: 18500, afterTax: 101500 },
};

const TaxHealthPage = ({ healthData, onEditIncome, incomeProfile }) => {
  const d = healthData ?? FALLBACK;

  return (
    <div className="tax-health-page">

      {/* Header */}
      <div className="page-header">
        <h2>Tax & Financial Health</h2>
        <p className="subtitle">Monitor your overall financial wellness</p>
        <div className="income-row">
          <span>
            Monthly Income: {incomeProfile
              ? `KSh ${Number(incomeProfile.declaredMonthlyIncome).toLocaleString()}`
              : "Not set"}
          </span>
          <button onClick={onEditIncome}>
            {incomeProfile ? "Edit Income" : "Set Income"}
          </button>
        </div>
      </div>

      {/* Health Score */}
      <HealthScoreCard
        score={d.score}
        description={d.description}
      />

      {/* Metric Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Savings Rate"
          value={d.metrics.savingsRate}
          target={50}
          icon={<FaWallet />}
        />
        <MetricCard
          title="Debt to Income"
          value={d.metrics.debtToIncome}
          target={36}
          icon={<FaShieldAlt />}
          warning={d.metrics.debtToIncome > 36}
        />
        <MetricCard
          title="Emergency Fund"
          value={d.metrics.emergencyFund}
          target={100}
          icon={<FaHeart />}
        />
        <MetricCard
          title="Investment Growth"
          value={d.metrics.investmentGrowth}
          target={10}
          icon={<FaChartLine />}
        />
      </div>

      {/* Tax Summary */}
      <TaxSummary summary={d.taxSummary} />

    </div>
  );
};

export default TaxHealthPage;