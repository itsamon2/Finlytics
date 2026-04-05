import "./TaxSummary.css";

const formatKES = (value) =>
  `KSh ${(value ?? 0).toLocaleString()}`;

const SummaryCard = ({ label, value }) => (

  <div className="summary-card">

    <p>{label}</p>

    <h2>{formatKES(value)}</h2>

  </div>

);

const TaxSummary = ({ summary = {} }) => {

  return (

    <div className="tax-summary">

      <h3>Estimated Tax Summary (2026)</h3>

      <div className="summary-container">

        <SummaryCard
          label="Gross Income"
          value={summary.grossIncome}
        />

        <SummaryCard
          label="Total Deductions"
          value={summary.deductions}
        />

        <SummaryCard
          label="Estimated Tax"
          value={summary.estimatedTax}
        />

        <SummaryCard
          label="After Tax"
          value={summary.afterTax}
        />

      </div>

    </div>

  );

};

export default TaxSummary;