import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEye, FiDatabase, FiMail, FiServer, FiClock, FiCheckCircle } from 'react-icons/fi';
import './LegalPage.css';

const PrivacyPage = () => {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const sections = [
    {
      icon: <FiShield />,
      title: 'Why We Collect Your Information',
      content: (
        <ul>
          <li>Provide, operate, and improve our financial analytics services</li>
          <li>Deliver personalized financial insights and reports</li>
          <li>Maintain system security and prevent fraud</li>
          <li>Comply with legal and regulatory obligations</li>
        </ul>
      )
    },
    {
      icon: <FiDatabase />,
      title: 'What Information We Collect',
      content: (
        <ul>
          <li><strong>Identity Information:</strong> Name, email, phone number, login credentials</li>
          <li><strong>Financial Information:</strong> Income, expenses, budgets, transactions</li>
          <li><strong>Technical Information:</strong> IP address, device type, browser, usage data</li>
          <li><strong>Third-Party Data:</strong> Data from integrated financial services with your consent</li>
        </ul>
      )
    },
    {
      icon: <FiLock />,
      title: 'Legal Basis for Processing',
      content: (
        <ul>
          <li>Your consent</li>
          <li>Performance of a contract (providing services)</li>
          <li>Compliance with legal obligations</li>
          <li>Legitimate business interests</li>
        </ul>
      )
    },
    {
      icon: <FiEye />,
      title: 'Information Sharing',
      content: (
        <>
          <ul>
            <li>Trusted service providers (hosting, analytics)</li>
            <li>Regulatory or legal authorities when required</li>
            <li>With your explicit consent</li>
            <li>During mergers or business transfers</li>
          </ul>
          <p className="highlight"><strong>We do not sell your personal data.</strong></p>
        </>
      )
    },
    {
      icon: <FiServer />,
      title: 'Data Protection',
      content: (
        <ul>
          <li>Encrypted storage and secure data transmission</li>
          <li>Restricted internal access controls</li>
          <li>Secure authentication systems</li>
          <li>Continuous monitoring for security threats</li>
        </ul>
      )
    },
    {
      icon: <FiClock />,
      title: 'Data Retention',
      content: (
        <p>We retain personal data only as long as necessary for service delivery, legal compliance, and dispute resolution. You may request deletion of your data where applicable.</p>
      )
    },
    {
      icon: <FiCheckCircle />,
      title: 'Your Rights',
      content: (
        <>
          <p>Under the Data Protection Act, 2019 of Kenya, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <div className="legal-page">
      {/* Hero Section */}
      <section className="legal-hero">
        <div className="legal-hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your privacy is our priority. Learn how we protect your financial data.
          </motion.p>
          <motion.div
            className="legal-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>📅 Effective Date: 1 May 2026</span>
            <span>📍 Kenya Data Protection Act, 2019</span>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <motion.section
        className="legal-intro"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="legal-intro-content">
          <div className="legal-logo">Finlytics</div>
          <p>
            Finlytics is dedicated to protecting your privacy and handling your personal data in 
            full compliance with the <strong>Data Protection Act, 2019 of Kenya</strong>. We value 
            transparency, integrity, and trust. This Privacy Policy explains how we collect, use, 
            and safeguard your personal and financial information.
          </p>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="legal-container">
        <div className="legal-grid">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              className="legal-card"
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="legal-card-icon">{section.icon}</div>
              <h2>{section.title}</h2>
              <div className="legal-card-content">{section.content}</div>
            </motion.div>
          ))}
        </div>

        {/* Data Controller Section */}
        <motion.div
          className="legal-contact"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2>9. Data Controller</h2>
          <p>
            Finlytics acts as the Data Controller of your personal data. For inquiries or requests 
            regarding your data, contact:
          </p>
          <div className="contact-info">
            <p><strong>Finlytics Support Team</strong></p>
            <p><FiMail /> support@finlytics.com</p>
            {/* <p><FiMapPin /> Nairobi, Kenya</p> */}
          </div>
        </motion.div>

        {/* Regulatory Authority */}
        <motion.div
          className="legal-regulatory"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2>10. Regulatory Authority</h2>
          <p>
            You have the right to lodge a complaint with the{' '}
            <strong>Office of the Data Protection Commissioner (ODPC)</strong> in Kenya if you 
            believe your data rights have been violated.
          </p>
        </motion.div>

        {/* Cookies Section */}
        <motion.div
          className="legal-cookies"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2>8. Cookies and Tracking</h2>
          <p>
            We may use cookies and similar technologies to enhance user experience and analyze 
            platform usage. You can control cookie preferences in your browser settings.
          </p>
        </motion.div>

        {/* Policy Changes */}
        <motion.div
          className="legal-changes"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this 
            page, and continued use of the Platform constitutes acceptance of the updated policy.
          </p>
        </motion.div>

        {/* Footer */}
        <div className="legal-footer">
          <p>End of Privacy Policy</p>
          <div className="legal-footer-links">
            <Link to="/">Home</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;