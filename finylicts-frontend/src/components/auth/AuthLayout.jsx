import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AuthLayout.css';

const AuthLayout = ({ children, title, subtitle }) => {
  // Animation variants
  const leftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 0.2 }
    }
  };

  const floatingIcons = [
    { icon: '💰', delay: 0, x: 10, y: 10 },
    { icon: '📊', delay: 0.5, x: -15, y: -15 },
    { icon: '🎯', delay: 1, x: 20, y: -20 },
    { icon: '📈', delay: 1.5, x: -20, y: 15 }
  ];

  return (
    <div className="auth-container">
      {/* Left Side - Branding */}
      <motion.div 
        className="auth-left"
        variants={leftVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating Icons Animation */}
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="floating-icon"
            initial={{ opacity: 0, x: item.x, y: item.y }}
            animate={{ 
              opacity: 0.1,
              x: [item.x, item.x + 10, item.x - 10, item.x],
              y: [item.y, item.y - 10, item.y + 10, item.y]
            }}
            transition={{
              duration: 8,
              delay: item.delay,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {item.icon}
          </motion.div>
        ))}

        <div className="auth-brand">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Finlytics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Personal Finance
          </motion.p>
        </div>

        <div className="auth-illustration">
          <motion.div 
            className="illustration-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2>Take Control of Your Financial Future</h2>
            <div className="feature-list">
              {[
                { icon: '💰', text: 'Track every transaction in real-time' },
                { icon: '📊', text: 'Visualize spending with beautiful charts' },
                { icon: '🎯', text: 'Set and achieve financial goals' },
                { icon: '🔮', text: 'Plan with what-if scenarios' }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="feature-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                  whileHover={{ x: 10 }}
                >
                  <span className="feature-icon">{feature.icon}</span>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>© 2026 Finlytics. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/terms">Terms</Link>
            <span>•</span>
            <Link to="/privacy">Privacy</Link>
            <span>•</span>
            <Link to="/security">Security</Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        className="auth-right"
        variants={rightVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="auth-card">
          <motion.div 
            className="auth-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </motion.div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;