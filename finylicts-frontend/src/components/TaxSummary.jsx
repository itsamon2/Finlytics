import React from "react";
import "./TaxSummary.css";

const TaxSummary = () => {
  return (
    <div className="tax-summary">
      <h3>Estimated Tax Summary (2026)</h3>

      <div className="summary-container">
        <div className="summary-card">
          <p>Gross Income</p>
          <h2>KSh 120,000</h2>
        </div>

        <div className="summary-card">
          <p>Total Deductions</p>
          <h2>KSh 35,000</h2>
        </div>

        <div className="summary-card">
          <p>Estimated Tax</p>
          <h2>KSh 18,500</h2>
        </div>

        <div className="summary-card">
          <p>After Tax</p>
          <h2>KSh 101,500</h2>
        </div>
      </div>
    </div>
  );
};

export default TaxSummary;