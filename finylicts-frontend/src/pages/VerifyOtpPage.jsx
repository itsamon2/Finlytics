import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import './LoginPage.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const VerifyOtpPage = () => {
  const navigate          = useNavigate();
  const location          = useLocation();
  const { loginAfterOtp } = useAuth(); // ✅ logs user in after OTP verified

  const emailFromState = location.state?.email || '';

  const [otp,         setOtp]         = useState(['', '', '', '', '', '']);
  const [email]                       = useState(emailFromState);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend,   setCanResend]   = useState(false);

  const inputRefs = useRef([]);

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer === 0) { setCanResend(true); return; }
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ── Animation variants (matches RegisterPage) ───────────────────────────────
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


  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Submit OTP ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) { setError('Please enter the complete 6-digit OTP'); return; }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified! Redirecting...');

        // ✅ Persist token + user data so user is fully logged in
        loginAfterOtp(data);

        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(data.message || 'Verification failed. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('A new OTP has been sent to your email.');
        setOtp(['', '', '', '', '', '']);
        setResendTimer(60);
        setCanResend(false);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="login-background"></div>

      <div className="login-container">
        <motion.div
          className="login-card-enhanced"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="card-logo">
            <h1>Finlytics</h1>
            <p>Personal Finance</p>
          </motion.div>

          {/* Email icon badge */}
          <motion.div
            variants={itemVariants}
            style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0 1rem' }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary, #6366f1), var(--primary-dark, #4f46e5))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            }}>
              <FiMail size={28} color="#fff" />
            </div>
          </motion.div>

          <motion.h2 variants={itemVariants} className="card-title">
            Verify Your Email
          </motion.h2>

          <motion.p variants={itemVariants} className="card-subtitle">
            We sent a 6-digit code to<br />
            <strong>{email || 'your email'}</strong>
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

          {/* Success */}
          {success && (
            <motion.div
              className="error-message"
              style={{ background: 'rgba(16,185,129,0.1)', borderColor: '#10B981', color: '#10B981' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span>✓</span> {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="login-form">

            {/* 6-digit OTP boxes */}
            <motion.div variants={itemVariants} className="form-group">
              <label style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                Enter OTP Code
              </label>

              <div
                style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    disabled={isLoading}
                    whileFocus={{ scale: 1.08 }}
                    style={{
                      width: 48, height: 56,
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      border: digit
                        ? '2px solid var(--primary, #6366f1)'
                        : '2px solid var(--border, #e5e7eb)',
                      borderRadius: 12,
                      background: digit
                        ? 'rgba(99,102,241,0.06)'
                        : 'var(--input-bg, #f9fafb)',
                      color: 'var(--text, #111)',
                      outline: 'none',
                      transition: 'all 0.2s',
                      caretColor: 'var(--primary, #6366f1)',
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Submit */}
            <motion.button
              variants={itemVariants}
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || otp.join('').length < 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading
                ? (<><span className="spinner"></span>Verifying...</>)
                : (<>Verify Email <FiArrowRight className="button-icon" /></>)
              }
            </motion.button>

            {/* Resend */}
            <motion.div
              variants={itemVariants}
              style={{ textAlign: 'center', marginTop: '1rem' }}
            >
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: 'var(--primary, #6366f1)', fontWeight: 600, fontSize: '0.9rem',
                  }}
                >
                  <FiRefreshCw size={14} />
                  Resend OTP
                </button>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #9ca3af)' }}>
                  Resend code in <strong style={{ color: 'var(--text, #374151)' }}>{resendTimer}s</strong>
                </span>
              )}
            </motion.div>

            {/* Back to register */}
            <motion.div variants={itemVariants} className="signup-link">
              <span>Wrong email?</span>
              <a
                href="/register"
                style={{ color: 'var(--primary, #6366f1)', fontWeight: 600, textDecoration: 'none' }}
              >
                Go back
              </a>
            </motion.div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;