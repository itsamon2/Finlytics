import "./TaxHealthPage.css";
import HealthScoreCard from '../components/HealthScoreCard';
import MetricCard from '../components/MetricCard';
import TaxSummary from '../components/TaxSummary';
import { FaWallet, FaShieldAlt, FaHeart, FaChartLine } from "react-icons/fa";

import Layout from "../components/Layout";


function TaxHealthPage() {
  return (
    <Layout>
    <div className="page-header">
      
      <h3>Tax & Financial Health</h3>
      <p className="subtitle">
        Monitor your overall financial wellness
      </p>

      </div>
      
      <HealthScoreCard />

      <div className="metrics-grid">
        <MetricCard title="Savings Rate" value={40} target={50} icon={<FaWallet />} />
        <MetricCard title="Debt-to-Income" value={22} target={36} icon={<FaShieldAlt />} />
        <MetricCard title="Emergency Fund" value={57} target={100} warning icon={<FaHeart />} />
        <MetricCard title="Investment Growth" value={8.2} target={10} icon={<FaChartLine />} />
      </div>

      <TaxSummary />
      
  
    </Layout>
  );
}

export default TaxHealthPage;