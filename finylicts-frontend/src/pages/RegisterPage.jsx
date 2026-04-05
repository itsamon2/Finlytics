import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms,          setAgreeTerms]          = useState(false);
  const [isLoading,           setIsLoading]           = useState(false);
  const [error,               setError]               = useState('');
  const [focusedField,        setFocusedField]        = useState(null);
  const [passwordStrength,    setPasswordStrength]    = useState(0);

  // ── Animation variants ──────────────────────────────────────────────────────
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

  // ── Validators ──────────────────────────────────────────────────────────────
  const validateName = (v) => {
    if (!v)                           return 'Name is required';
    if (!/^[A-Za-z\s]*$/.test(v))    return 'Name can only contain letters and spaces';
    if (v.trim().length < 2)         return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (v) => {
    if (!v)                                  return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (v) => {
    if (!v)           return 'Phone number is required';
    if (v.length < 10) return 'Please enter a valid phone number';
    return '';
  };

  const validatePassword = (v) => {
    if (!v)          return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateConfirmPassword = (v) => {
    if (!v)                         return 'Please confirm your password';
    if (v !== formData.password)    return 'Passwords do not match';
    return '';
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      const filtered = value.replace(/[^A-Za-z\s]/g, '');
      setFormData(prev => ({ ...prev, name: filtered }));
      setErrors(prev => ({ ...prev, name: validateName(filtered) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (name === 'email') {
        setErrors(prev => ({ ...prev, email: validateEmail(value) }));
      } else if (name === 'password') {
        setErrors(prev => ({ ...prev, password: validatePassword(value) }));
        let strength = 0;
        if (value.length >= 8)           strength++;
        if (value.match(/[a-z]/))        strength++;
        if (value.match(/[A-Z]/))        strength++;
        if (value.match(/[0-9]/))        strength++;
        if (value.match(/[^a-zA-Z0-9]/)) strength++;
        setPasswordStrength(strength);
        if (formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(formData.confirmPassword) }));
        }
      } else if (name === 'confirmPassword') {
        setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value) }));
      }
    }
    setError('');
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phoneNumber: value || '' }));
    setErrors(prev => ({ ...prev, phoneNumber: validatePhone(value || '') }));
    setError('');
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2)  return 'Weak';
    if (passwordStrength <= 4)  return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return '#EF4444';
    if (passwordStrength <= 4) return '#F59E0B';
    return '#10B981';
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr    = validateName(formData.name);
    const emailErr   = validateEmail(formData.email);
    const phoneErr   = validatePhone(formData.phoneNumber);
    const passErr    = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(formData.confirmPassword);

    setErrors({ name: nameErr, email: emailErr, phoneNumber: phoneErr,
                password: passErr, confirmPassword: confirmErr });

    if (nameErr || emailErr || phoneErr || passErr || confirmErr) return;

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await register(
        formData.name.trim(),
        formData.email,
        formData.password,
        formData.phoneNumber,
        '' // location removed — pass empty string to keep API signature
      );

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="login-background"></div>

      <div className="register-container">
        <motion.div
          className="register-card-enhanced"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="card-logo">
            <h1>Finlytics</h1>
            <p>Personal Finance</p>
          </motion.div>

          <motion.h2 variants={itemVariants} className="card-title">Create Account</motion.h2>
          <motion.p variants={itemVariants} className="card-subtitle">
            Join thousands of users managing their finances smarter
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

            {/* Full Name */}
            <motion.div variants={itemVariants} className="form-group">
              <label className={focusedField === 'name' ? 'focused' : ''}>
                <FiUser className="field-icon" />
                Full Name
              </label>
              <div className={`input-wrapper ${errors.name ? 'error' : ''}`}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                />
                {formData.name && !errors.name && (
                  <motion.span className="input-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>
                )}
              </div>
              {errors.name && (
                <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  {errors.name}
                </motion.span>
              )}
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants} className="form-group">
              <label className={focusedField === 'email' ? 'focused' : ''}>
                <FiMail className="field-icon" />
                Email Address
              </label>
              <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
                {formData.email && !errors.email && (
                  <motion.span className="input-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>
                )}
              </div>
              {errors.email && (
                <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  {errors.email}
                </motion.span>
              )}
            </motion.div>

            {/* Phone — FiPhone icon (correct icon for phone field) */}
            <motion.div variants={itemVariants} className="form-group">
              <label className={focusedField === 'phone' ? 'focused' : ''}>
                <FiPhone className="field-icon" />
                Phone Number
              </label>
              <div className={`input-wrapper phone-input-wrapper ${errors.phoneNumber ? 'error' : ''}`}>
                <PhoneInput
                  international
                  defaultCountry="KE"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  disabled={isLoading}
                  className="phone-input-enhanced"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
                {formData.phoneNumber && !errors.phoneNumber && (
                  <motion.span className="input-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>
                )}
              </div>
              {errors.phoneNumber && (
                <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  {errors.phoneNumber}
                </motion.span>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="form-group">
              <label className={focusedField === 'password' ? 'focused' : ''}>
                <FiLock className="field-icon" />
                Password
              </label>
              <div className={`input-wrapper password-wrapper ${errors.password ? 'error' : ''}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
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
              {errors.password ? (
                <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  {errors.password}
                </motion.span>
              ) : (
                formData.password && (
                  <motion.div className="password-strength" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="strength-bar">
                      <motion.div
                        className="strength-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        style={{ backgroundColor: getStrengthColor() }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', color: getStrengthColor() }}>{getStrengthText()}</span>
                  </motion.div>
                )
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants} className="form-group">
              <label className={focusedField === 'confirmPassword' ? 'focused' : ''}>
                <FiLock className="field-icon" />
                Confirm Password
              </label>
              <div className={`input-wrapper password-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  {errors.confirmPassword}
                </motion.span>
              )}
              {formData.password && formData.confirmPassword && !errors.confirmPassword && (
                <motion.div className="password-match" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span className="match-success">✓ Passwords match</span>
                </motion.div>
              )}
            </motion.div>

            {/* Terms */}
            <motion.div variants={itemVariants} className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>
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
                ? (<><span className="spinner"></span>Creating Account...</>)
                : (<>Create Account<FiArrowRight className="button-icon" /></>)
              }
            </motion.button>

            <motion.div variants={itemVariants} className="signup-link">
              <span>Already have an account?</span>
              <Link to="/login">Sign in</Link>
            </motion.div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;