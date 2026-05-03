import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiX, FiSave, FiTrendingUp, FiHome, FiBriefcase, FiShoppingBag, FiHeart, FiBook, FiCheck } from 'react-icons/fi';
import { transactionService } from '../service/api';
import './SavingsPromptModal.css';

const SavingsPromptModal = ({ isOpen, onClose, transactionData, onSave }) => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoal, setCustomGoal]     = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);

  // Reset state when modal opens with new transaction
  useEffect(() => {
    if (isOpen) {
      setSelectedGoal('');
      setCustomGoal('');
      setShowCustomInput(false);
      setError('');
      setSuccess(false);
    }
  }, [isOpen, transactionData]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const predefinedGoals = [
    { id: 'emergency',  label: 'Emergency Fund',       icon: <FiSave />,      color: '#2DD4BF' },
    { id: 'vacation',   label: 'Vacation',              icon: <FiTrendingUp />, color: '#F59E0B' },
    { id: 'housing',    label: 'Housing / Rent',        icon: <FiHome />,      color: '#3B82F6' },
    { id: 'business',   label: 'Business Investment',   icon: <FiBriefcase />, color: '#8B5CF6' },
    { id: 'shopping',   label: 'Shopping',              icon: <FiShoppingBag />, color: '#EC4899' },
    { id: 'education',  label: 'Education Fund',        icon: <FiBook />,      color: '#10B981' },
    { id: 'charity',    label: 'Charity / Giving',      icon: <FiHeart />,     color: '#EF4444' },
  ];

  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
    setShowCustomInput(false);
    setCustomGoal('');
    setError('');
  };

  const handleCustomSelect = () => {
    setShowCustomInput(true);
    setSelectedGoal('custom');
    setError('');
  };

  const handleSubmit = async () => {
    const goalHint = selectedGoal === 'custom'
      ? customGoal.trim()
      : predefinedGoals.find(g => g.id === selectedGoal)?.label;

    if (!goalHint) {
      setError('Please select or enter a goal.');
      return;
    }

    if (!transactionData?.transactionId) {
      setError('Transaction data is missing.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await transactionService.assignGoalToTransaction(
        transactionData.transactionId,
        goalHint
      );

      if (result?.matched) {
        setSuccess(true);
        // Notify parent if provided
        if (onSave) onSave(result);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // No existing goal matched — offer to create one
        setError(result?.message || `No goal matched "${goalHint}". Create a goal with this name first.`);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('assignGoalToTransaction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="savings-modal-overlay" onClick={onClose}>
          <motion.div
            className="savings-modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="savings-modal-close" onClick={onClose}>
              <FiX />
            </button>

            {/* Icon */}
            <div className="savings-modal-icon">
              <FiSave />
            </div>

            {success ? (
              // ── Success state ──────────────────────────────────
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="savings-success-state"
              >
                <div className="savings-success-icon">🎯</div>
                <h2 className="savings-modal-title">Goal Updated!</h2>
                <p className="savings-modal-subtitle">
                  {formatAmount(transactionData?.amount || 0)} has been added to your goal.
                </p>
              </motion.div>
            ) : (
              // ── Selection state ────────────────────────────────
              <>
                <h2 className="savings-modal-title">Savings Detected! 🎯</h2>

                <p className="savings-modal-subtitle">
                  We noticed a savings transaction of{' '}
                  <strong>{formatAmount(transactionData?.amount || 0)}</strong>.
                  {transactionData?.suggestedGoal && (
                    <> Looks like it might be for <strong>{transactionData.suggestedGoal}</strong>.</>
                  )}
                </p>

                <p className="savings-modal-question">What are you saving toward?</p>

                {/* Error message */}
                {error && (
                  <motion.p
                    className="savings-modal-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ⚠️ {error}
                  </motion.p>
                )}

                {/* Goal Selection Grid */}
                <div className="savings-goals-grid">
                  {predefinedGoals.map((goal) => (
                    <button
                      key={goal.id}
                      className={`savings-goal-card ${selectedGoal === goal.id ? 'selected' : ''}`}
                      onClick={() => handleGoalSelect(goal.id)}
                      style={{ '--goal-color': goal.color }}
                    >
                      <span className="goal-icon" style={{ color: goal.color }}>{goal.icon}</span>
                      <span className="goal-label">{goal.label}</span>
                      {selectedGoal === goal.id && <FiCheck className="goal-check" />}
                    </button>
                  ))}

                  {/* Custom Goal */}
                  <button
                    className={`savings-goal-card custom ${selectedGoal === 'custom' ? 'selected' : ''}`}
                    onClick={handleCustomSelect}
                  >
                    <span className="goal-icon">✏️</span>
                    <span className="goal-label">Custom Goal</span>
                    {selectedGoal === 'custom' && <FiCheck className="goal-check" />}
                  </button>
                </div>

                {/* Custom Goal Input */}
                {showCustomInput && (
                  <motion.div
                    className="savings-custom-input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <input
                      type="text"
                      placeholder="e.g., New Laptop, Wedding, Business..."
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      className="custom-goal-input"
                      autoFocus
                    />
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="savings-modal-actions">
                  <button className="savings-skip-btn" onClick={onClose}>
                    Skip for now
                  </button>
                  <button
                    className={`savings-save-btn ${(!selectedGoal || (selectedGoal === 'custom' && !customGoal)) ? 'disabled' : ''}`}
                    onClick={handleSubmit}
                    disabled={!selectedGoal || (selectedGoal === 'custom' && !customGoal) || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="savings-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiTarget />
                        Save to Goal
                      </>
                    )}
                  </button>
                </div>

                <p className="savings-modal-note">
                  This will help us track your progress in Goals & Budgets.
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SavingsPromptModal;