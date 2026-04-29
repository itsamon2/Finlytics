import { useState, useEffect } from "react";
import { healthService, incomeProfileService } from "../service/api";
import TaxHealthPage from "./TaxHealthPage";
import IncomeProfileModal from "../components/IncomeProfileModal";

const TaxHealthPageWrapper = () => {
  const [healthData,    setHealthData]    = useState(null);
  const [incomeProfile, setIncomeProfile] = useState(null);
  const [showModal,     setShowModal]     = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try to get income profile first
      let profile = null;
      try {
        profile = await incomeProfileService.get();
        setIncomeProfile(profile);
      } catch {
        // No profile yet — show modal and stop, don't fetch metrics
        setShowModal(true);
        setLoading(false);
        return;
      }

      // 2. Only fetch metrics if profile exists
      const [metrics, tax] = await Promise.all([
        healthService.getMetrics(),
        healthService.getTaxSummary(),
      ]);

      setHealthData({
        score:       metrics.healthScore?.score ?? 0,
        description: metrics.healthScore?.label ?? "No data available",
        metrics: {
          savingsRate:      metrics.savingsRate      ?? 0,
          debtToIncome:     metrics.debtToIncome     ?? 0,
          emergencyFund:    metrics.emergencyFund     ?? 0,
          investmentGrowth: Number(metrics.investmentGrowth ?? 0),
        },
        taxSummary: {
          grossIncome:  Number(tax.grossIncome       ?? 0),
          deductions:   Number(tax.totalDeductions   ?? 0),
          estimatedTax: Number(tax.estimatedTax      ?? 0),
          afterTax:     Number(tax.afterTax          ?? 0),
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaved = () => {
    setShowModal(false);
    fetchAll();
  };

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;

  return (
    <>
      {showModal && (
        <IncomeProfileModal
          existing={incomeProfile}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
      <TaxHealthPage
        healthData={healthData}
        onEditIncome={() => setShowModal(true)}
        incomeProfile={incomeProfile}
      />
    </>
  );
};

export default TaxHealthPageWrapper;