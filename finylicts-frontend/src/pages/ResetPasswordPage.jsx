import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import backgroundImage from '../assets/images/finance.jpg';
import './LoginPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);
  const [focusedField,    setFocusedField]    = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // Redirect if no token in URL
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const cardVariants = {
    hidden:  { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div
        className="login-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="background-overlay-light" />

      <div className="forgot-password-container">
        <motion.div
          className="forgot-password-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back button */}
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
              <motion.h2 variants={itemVariants} className="card-title">
                Set New Password
              </motion.h2>
              <motion.p variants={itemVariants} className="card-subtitle">
                Choose a strong password for your account.
              </motion.p>

              {/* Error */}
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

              <form onSubmit={handleSubmit} className="login-form">

                {/* New Password */}
                <motion.div variants={itemVariants} className="form-group">
                  <label className={focusedField === 'password' ? 'focused' : ''}>
                    <FiLock className="field-icon" />
                    New Password
                  </label>
                  <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Min. 8 characters"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="input-check"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemVariants} className="form-group">
                  <label className={focusedField === 'confirm' ? 'focused' : ''}>
                    <FiLock className="field-icon" />
                    Confirm Password
                  </label>
                  <div className={`input-wrapper ${focusedField === 'confirm' ? 'focused' : ''}`}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Repeat your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="input-check"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </motion.div>

                {/* Password strength hint */}
                {newPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      fontSize: '0.75rem',
                      color: newPassword.length >= 8 ? '#10B981' : '#F59E0B',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {newPassword.length >= 8 ? '✓ Strong enough' : `${8 - newPassword.length} more characters needed`}
                  </motion.p>
                )}

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  className={`login-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <><span className="spinner" /> Resetting...</>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <motion.div className="success-state" variants={itemVariants}>
              <motion.div
                className="success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <FiCheckCircle />
              </motion.div>

              <motion.h2 variants={itemVariants} className="success-title">
                Password Reset!
              </motion.h2>

              <motion.p variants={itemVariants} className="success-message">
                Your password has been updated successfully. You can now log in with your new password.
              </motion.p>

              <motion.button
                variants={itemVariants}
                className="back-to-login-btn"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Go to Login
              </motion.button>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="forgot-footer">
            <span>Remember your password? </span>
            <Link to="/login">Sign in</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;