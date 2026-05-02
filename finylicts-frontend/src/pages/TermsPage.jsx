import React from "react";
import './LegalPage.css';

const TermsPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>Terms and Conditions</h1>
      <h2>Finlytics Platform</h2>

      <p><strong>Effective Date:</strong> 1 May 2026.</p>

      <h2>1. Introduction</h2>
      <p>
        These Terms and Conditions constitute a legally binding agreement between you and Finlytics platform.
      </p>
      <p>
        By accessing or using the Platform, you agree to be bound by these Terms in accordance with the laws of Kenya.
      </p>

      <h2>2. Eligibility</h2>
      <ul>
        <li>You must be at least 18 years old or have valid guardian consent.</li>
        <li>You must have legal capacity to enter into binding agreements.</li>
        <li>You must comply with all applicable laws in Kenya.</li>
      </ul>

      <h2>3. Account Registration and Security</h2>
      <ul>
        <li>Provide accurate and complete information.</li>
        <li>Maintain confidentiality of your login credentials.</li>
        <li>You are responsible for all activities under your account.</li>
        <li>Report unauthorized access immediately.</li>
      </ul>

      <h2>4. Services</h2>
      <ul>
        <li>Income and expense tracking</li>
        <li>Budgeting tools</li>
        <li>Financial reports and analytics</li>
        <li>AI insights </li>
      </ul>

      <h2>5. Financial Disclaimer</h2>
      <p>
        Finlytics does not provide financial, investment, or tax advice and is not regulated by the Capital Markets Authority (CMA).
      </p>
      <p>
        All information and outputs are for informational purposes only. Users should consult licensed professionals before making financial decisions.
      </p>

      <h2>6. User Responsibilities</h2>
      <ul>
        <li>No illegal or fraudulent use of the Platform.</li>
        <li>No hacking, unauthorized access, or system interference.</li>
        <li>No submission of false or misleading data.</li>
        <li>Compliance with the Computer Misuse and Cybercrimes Act, 2018.</li>
      </ul>

      <h2>7. Data Privacy</h2>
      <p>
        Finlytics complies with the Data Protection Act, 2019 of Kenya.
      </p>
      <ul>
        <li>Data is collected and processed lawfully and transparently.</li>
        <li>We do not sell personal data to third parties.</li>
        <li>Appropriate security measures are in place to protect user data.</li>
        <li>Users have rights to access, correct, or delete their data.</li>
      </ul>

      <h2>8. Intellectual Property</h2>
      <p>
        All content and software on the Platform are the property of Finlytics.
      </p>
      <p>
        Users are granted a limited, non-transferable license for personal use only.
      </p>

      <h2>9. Service Availability</h2>
      <p>
        We do not guarantee uninterrupted or error-free service. The Platform may be unavailable due to maintenance or technical issues.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the extent permitted under the Consumer Protection Act, 2012, Finlytics shall not be liable for financial losses, indirect damages, or data loss resulting from use of the Platform.
      </p>

      <h2>11. Termination</h2>
      <p>
        Accounts may be suspended or terminated without prior notice if these Terms are violated or illegal activity is detected.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We reserve the right to update these Terms at any time. Continued use of the Platform constitutes acceptance of the updated Terms.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms shall be governed by and interpreted in accordance with the laws of Kenya.
      </p>

      <h2>14. Dispute Resolution</h2>
      <p>
        Disputes shall first be resolved through negotiation or mediation. If unresolved, they shall be submitted to courts of competent jurisdiction in Kenya.
      </p>

      <h2>15. Contact</h2>
      <p>
        Finlytics Support Team<br />
       <a href="mailto:finlyticsusersupport@gmail.com">
  finlyticsusersupport@gmail.com
</a><br />
        
      </p>

      <p style={styles.footer}>End of Terms and Conditions</p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.7",
    color: "#222",
    padding: "20px",
    backgroundColor: "#fff",
  },
  h1: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#111",
  },
  footer: {
    marginTop: "40px",
    fontWeight: "bold",
    textAlign: "center",
  },
};

export default TermsPage;