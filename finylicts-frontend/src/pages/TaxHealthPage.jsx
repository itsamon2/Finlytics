import "./TaxHealthPage.css";
import HealthScoreCard from "../components/HealthScoreCard";
import MetricCard from "../components/MetricCard";
import TaxSummary from "../components/TaxSummary";

import {
  FaWallet,
  FaShieldAlt,
  FaHeart,
  FaChartLine,
} from "react-icons/fa";

const TaxHealthPage = ({ healthData }) => {

  const safeData = healthData ?? {
    score: 82,
    description: "Excellent financial stability",
    metrics: {
      savingsRate: 40,
      debtToIncome: 22,
      emergencyFund: 57,
      investmentGrowth: 8.2,
    },
    taxSummary: {
      grossIncome: 120000,
      deductions: 35000,
      estimatedTax: 18500,
      afterTax: 101500,
    },
  };

  return (
    <div className="tax-health-page">

      <div className="page-header">
        <h2>Tax & Financial Health</h2>
        <p className="subtitle">
          Monitor your overall financial wellness
        </p>
      </div>

      <HealthScoreCard
        score={safeData.score}
        description={safeData.description}
      />

      <div className="metrics-grid">

        <MetricCard
          title="Savings Rate"
          value={safeData.metrics.savingsRate}
          target={50}
          icon={<FaWallet />}
        />

        <MetricCard
          title="Debt-to-Income"
          value={safeData.metrics.debtToIncome}
          target={36}
          icon={<FaShieldAlt />}
        />

        <MetricCard
          title="Emergency Fund"
          value={safeData.metrics.emergencyFund}
          target={100}
          warning
          icon={<FaHeart />}
        />

        <MetricCard
          title="Investment Growth"
          value={safeData.metrics.investmentGrowth}
          target={10}
          icon={<FaChartLine />}
        />

      </div>

      <TaxSummary summary={safeData.taxSummary} />

    </div>
  );
};

export default TaxHealthPage;