import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import backgroundImage from '../assets/images/finance.jpg';
import './LoginPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Image */}
      <div 
        className="login-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      {/* Lighter Overlay */}
      <div className="background-overlay-light"></div>

      {/* Centered Container */}
      <div className="forgot-password-container">
        <motion.div 
          className="forgot-password-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            className="back-button"
            onClick={() => navigate('/login')}
          >
            <FiArrowLeft /> Back to Login
          </motion.button>

          {/* Logo */}
          <motion.div variants={itemVariants} className="card-logo">
            <h1>Finlytics</h1>
            <p>Personal Finance</p>
          </motion.div>

          {!success ? (
            <>
              {/* Title */}
              <motion.h2 variants={itemVariants} className="card-title">Reset Password</motion.h2>
              <motion.p variants={itemVariants} className="card-subtitle">
                Enter your email address and we'll send you instructions to reset your password.
              </motion.p>

              {/* Error Message */}
              {error && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="error-icon">⚠️</span>
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="login-form">
                {/* Email Field */}
                <motion.div variants={itemVariants} className="form-group">
                  <label className={focusedField === 'email' ? 'focused' : ''}>
                    <FiMail className="field-icon" />
                    Email Address
                  </label>
                  <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your@email.com"
                      required
                      disabled={isLoading}
                    />
                    {email && (
                      <motion.span 
                        className="input-check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  className={`login-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            /* Success State */
            <motion.div 
              className="success-state"
              variants={itemVariants}
            >
              <motion.div 
                className="success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <FiCheckCircle />
              </motion.div>
              
              <motion.h2 variants={itemVariants} className="success-title">
                Check Your Email
              </motion.h2>
              
              <motion.p variants={itemVariants} className="success-message">
                We've sent password reset instructions to:
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="success-email"
              >
                {email}
              </motion.div>
              
              <motion.p variants={itemVariants} className="success-note">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  className="resend-link"
                  onClick={() => setSuccess(false)}
                >
                  try again
                </button>
              </motion.p>

              <motion.button
                variants={itemVariants}
                className="back-to-login-btn"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Login
              </motion.button>
            </motion.div>
          )}

          {/* Footer Links */}
          <motion.div variants={itemVariants} className="forgot-footer">
            <span>Remember your password? </span>
            <Link to="/login">Sign in</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;