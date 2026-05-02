import React from "react";
import './LegalPage.css';

const PrivacyPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Privacy Policy</h1>
      <h2 style={styles.subtitle}>Finlytics</h2>

      <p><strong>Effective Date:</strong> 1 May 2026.</p>

      <p>
        Finlytics is committed to protecting your privacy
        and handling your personal data in accordance with the Data Protection Act, 2019 of Kenya.
      </p>

      <p>
        We value transparency, integrity, and trust. This Privacy Policy explains how
        we collect, use, and safeguard your personal and financial information.
      </p>

      <h2>1. Why We Collect Your Information</h2>
      <ul>
        <li>Provide, operate, and improve our financial analytics services</li>
        <li>Deliver personalized financial insights and reports</li>
        <li>Maintain system security and prevent fraud</li>
        <li>Comply with legal and regulatory obligations</li>
      </ul>

      <h2>2. What Information We Collect</h2>
      <ul>
        <li>
          <strong>Identity Information:</strong> Name, email, phone number, login credentials
        </li>
        <li>
          <strong>Financial Information:</strong> Income, expenses, budgets, transactions
        </li>
        <li>
          <strong>Technical Information:</strong> IP address, device type, browser, usage data
        </li>
        <li>
          <strong>Third-Party Data:</strong> Data from integrated financial services (e.g., banks, payment platforms) with your consent
        </li>
      </ul>

      <h2>3. Legal Basis for Processing</h2>
      <p>We process your data based on:</p>
      <ul>
        <li>Your consent</li>
        <li>Performance of a contract (providing services)</li>
        <li>Compliance with legal obligations</li>
        <li>Legitimate business interests</li>
      </ul>

      <h2>4. Information Sharing</h2>
      <ul>
        <li>Trusted service providers (hosting, analytics)</li>
        <li>Regulatory or legal authorities when required</li>
        <li>With your explicit consent</li>
        <li>During mergers or business transfers</li>
      </ul>

      <p><strong>We do not sell your personal data.</strong></p>

      <h2>5. Data Protection</h2>
      <ul>
        <li>Encrypted storage and secure data transmission</li>
        <li>Restricted internal access controls</li>
        <li>Secure authentication systems</li>
        <li>Continuous monitoring for security threats</li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>
        We retain personal data only as long as necessary for service delivery,
        legal compliance, and dispute resolution. You may request deletion of your data where applicable.
      </p>

      <h2>7. Your Rights</h2>
      <p>Under the Data Protection Act, 2019, you have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Object to or restrict processing</li>
        <li>Withdraw consent at any time</li>
      </ul>

      <h2>8. Cookies and Tracking</h2>
      <p>
        We may use cookies and similar technologies to enhance user experience
        and analyze platform usage. You can control cookie preferences in your browser settings.
      </p>

      <h2>9. Data Controller</h2>
      <p>
        Finlytics acts as the Data Controller of your personal data. For inquiries or requests regarding your data, contact:
      </p>
      <p>
        Finlytics Support Team <br />
        [Insert Email Address] <br />
        [Insert Physical Address]
      </p>

      <h2>10. Regulatory Authority</h2>
      <p>
        You have the right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC) in Kenya if you believe your data rights have been violated.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page, and continued use of the Platform constitutes acceptance of the updated policy.
      </p>

      <p style={styles.footer}>End of Privacy Policy</p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.7",
    color: "#222",
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#111",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "20px",
  },
  footer: {
    marginTop: "40px",
    fontWeight: "bold",
    textAlign: "center",
  },
};

export default PrivacyPage;