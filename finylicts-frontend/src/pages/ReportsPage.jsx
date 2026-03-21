import React from 'react';

const reports = [
  { month: "Jan", income: 5000, tax: 1000 },
  { month: "Feb", income: 6000, tax: 1200 },
  { month: "Mar", income: 5500, tax: 1100 }
];

const ReportsPage = () => {
  return (
    <div className="content-area" style={{ padding: '24px 32px' }}>
      
      <h1>Reports</h1>

      <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Tax</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((item, index) => (
            <tr key={index}>
              <td>{item.month}</td>
              <td>${item.income}</td>
              <td>${item.tax}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default ReportsPage;