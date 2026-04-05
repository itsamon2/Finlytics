import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import './LoginPage.css';

const GOOGLE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:8080') +
  '/oauth2/authorization/google';

const LoginPage = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState('');

  const cardVariants = {
    hidden:  { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_URL;
  };

  return (
    <div className="login-page">
      {/* Background div kept for compatibility but hidden via CSS */}
      <div className="login-background"></div>

      <div className="login-container">
        <motion.div className="login-card" variants={cardVariants} initial="hidden" animate="visible">

          <motion.div variants={itemVariants} className="card-logo">
            <h1>Finlytics</h1>
            <p>Personal Finance</p>
          </motion.div>

          <motion.h2 variants={itemVariants} className="card-title">Welcome Back</motion.h2>
          <motion.p variants={itemVariants} className="card-subtitle">
            Sign in to continue your financial journey
          </motion.p>

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

            {/* Email */}
            <motion.div variants={itemVariants} className="form-group">
              <label>
                <FiMail className="field-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="form-group">
              <label>
                <FiLock className="field-icon" />
                Password
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </motion.div>

            {/* Remember me + Forgot */}
            <motion.div variants={itemVariants} className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </motion.div>

            {/* Submit */}
            <motion.button
              variants={itemVariants}
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading
                ? (<><span className="spinner"></span>Signing in...</>)
                : (<>Log In<FiArrowRight className="button-icon" /></>)
              }
            </motion.button>

            {/* Divider */}
            <motion.div variants={itemVariants} className="divider">
              <span>or continue with</span>
            </motion.div>

            {/* Google only — full width */}
            <motion.div variants={itemVariants} className="social-buttons">
              <button
                type="button"
                className="social-btn google"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <span className="social-icon">G</span>
                <span>Continue with Google</span>
              </button>
            </motion.div>

            {/* Sign up link */}
            <motion.div variants={itemVariants} className="signup-link">
              <span>Don't have an account?</span>
              <Link to="/register">Create account</Link>
            </motion.div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;