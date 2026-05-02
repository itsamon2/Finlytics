import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiFileText, 
  FiUserCheck, 
  FiShield, 
  FiActivity, 
  FiAlertCircle, 
  FiLock, 
  FiCpu, 
  FiServer, 
  FiXCircle, 
  FiEdit, 
  FiGlobe, 
  FiMail,
  FiBriefcase
} from 'react-icons/fi';
import './LegalPage.css';

const TermsPage = () => {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const sections = [
    {
      icon: <FiFileText />,
      title: 'Introduction',
      content: (
        <>
          <p>
            These Terms and Conditions constitute a legally binding agreement between you and Finlytics 
            platform. By accessing or using the Platform, you agree to be bound by these Terms in 
            accordance with the laws of Kenya.
          </p>
        </>
      )
    },
    {
      icon: <FiUserCheck />,
      title: 'Eligibility',
      content: (
        <ul>
          <li>You must be at least 18 years old or have valid guardian consent.</li>
          <li>You must have legal capacity to enter into binding agreements.</li>
          <li>You must comply with all applicable laws in Kenya.</li>
        </ul>
      )
    },
    {
      icon: <FiShield />,
      title: 'Account Registration and Security',
      content: (
        <ul>
          <li>Provide accurate and complete information.</li>
          <li>Maintain confidentiality of your login credentials.</li>
          <li>You are responsible for all activities under your account.</li>
          <li>Report unauthorized access immediately.</li>
        </ul>
      )
    },
    {
      icon: <FiActivity />,
      title: 'Services',
      content: (
        <div className="services-grid">
          <span className="service-tag">Income & Expense Tracking</span>
          <span className="service-tag">Budgeting Tools</span>
          <span className="service-tag">Financial Reports & Analytics</span>
          <span className="service-tag">AI Insights</span>
        </div>
      )
    },
    {
      icon: <FiAlertCircle />,
      title: 'Financial Disclaimer',
      content: (
        <>
          <p>
            Finlytics does not provide financial, investment, or tax advice and is not regulated by 
            the Capital Markets Authority (CMA).
          </p>
          <p className="highlight-warning">
            All information and outputs are for informational purposes only. Users should consult 
            licensed professionals before making financial decisions.
          </p>
        </>
      )
    },
    {
      icon: <FiBriefcase />,
      title: 'User Responsibilities',
      content: (
        <ul>
          <li>No illegal or fraudulent use of the Platform.</li>
          <li>No hacking, unauthorized access, or system interference.</li>
          <li>No submission of false or misleading data.</li>
          <li>Compliance with the Computer Misuse and Cybercrimes Act, 2018.</li>
        </ul>
      )
    },
    {
      icon: <FiLock />,
      title: 'Data Privacy',
      content: (
        <>
          <p>Finlytics complies with the <strong>Data Protection Act, 2019 of Kenya</strong>.</p>
          <ul>
            <li>Data is collected and processed lawfully and transparently.</li>
            <li>We do not sell personal data to third parties.</li>
            <li>Appropriate security measures are in place to protect user data.</li>
            <li>Users have rights to access, correct, or delete their data.</li>
          </ul>
        </>
      )
    },
    {
      icon: <FiCpu />,
      title: 'Intellectual Property',
      content: (
        <>
          <p>All content and software on the Platform are the property of Finlytics.</p>
          <p>Users are granted a limited, non-transferable license for personal use only.</p>
        </>
      )
    },
    {
      icon: <FiServer />,
      title: 'Service Availability',
      content: (
        <p>
          We do not guarantee uninterrupted or error-free service. The Platform may be unavailable 
          due to maintenance or technical issues.
        </p>
      )
    },
    {
      icon: <FiXCircle />,
      title: 'Limitation of Liability',
      content: (
        <p className="highlight-warning">
          To the extent permitted under the Consumer Protection Act, 2012, Finlytics shall not be 
          liable for financial losses, indirect damages, or data loss resulting from use of the Platform.
        </p>
      )
    },
    {
      icon: <FiEdit />,
      title: 'Termination',
      content: (
        <p>
          Accounts may be suspended or terminated without prior notice if these Terms are violated 
          or illegal activity is detected.
        </p>
      )
    },
    {
      icon: <FiEdit />,
      title: 'Changes to Terms',
      content: (
        <p>
          We reserve the right to update these Terms at any time. Continued use of the Platform 
          constitutes acceptance of the updated Terms.
        </p>
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
            Terms and Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Please read these terms carefully before using Finlytics.
          </motion.p>
          <motion.div
            className="legal-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>📅 Effective Date: 1 May 2026</span>
            <span>⚖️ Governing Law: Kenya</span>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <motion.div
        className="disclaimer-banner"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="disclaimer-icon">⚠️</div>
        <div className="disclaimer-content">
          <strong>Important Legal Notice</strong>
          <p>
            These Terms and Conditions govern your use of the Finlytics platform. By registering or 
            using our services, you acknowledge that you have read, understood, and agree to be bound 
            by these terms.
          </p>
        </div>
      </motion.div>

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
              transition={{ delay: index * 0.03 }}
            >
              <div className="legal-card-icon">{section.icon}</div>
              <h2>{section.title}</h2>
              <div className="legal-card-content">{section.content}</div>
            </motion.div>
          ))}
        </div>

        {/* Dispute Resolution Section */}
        <motion.div
          className="legal-contact"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2>14. Dispute Resolution</h2>
          <p>
            Disputes shall first be resolved through negotiation or mediation. If unresolved, they 
            shall be submitted to courts of competent jurisdiction in Kenya.
          </p>
        </motion.div>

        {/* Governing Law Section */}
        <motion.div
          className="legal-regulatory"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and interpreted in accordance with the laws of Kenya.
          </p>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="legal-contact"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2>15. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="contact-info">
            <p><strong>Finlytics Support Team</strong></p>
            <p><FiMail /> finlyticsusersupport@gmail.com</p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="legal-footer">
          <p>End of Terms and Conditions</p>
          <div className="legal-footer-links">
            <Link to="/">Home</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;