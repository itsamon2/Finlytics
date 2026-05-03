import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiX, FiSave, FiCheck, FiPlus } from 'react-icons/fi';
import { transactionService, goalsService } from '../service/api';
import './SavingsPromptModal.css';

const SavingsPromptModal = ({ isOpen, onClose, transactionData, onSave }) => {
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [customGoal,     setCustomGoal]     = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isFetching,     setIsFetching]     = useState(false);
  const [goals,          setGoals]          = useState([]);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState(false);

  // ── Reset + fetch real goals when modal opens ──────────────────
  useEffect(() => {
    if (!isOpen) return;

    setSelectedGoalId(null);
    setCustomGoal('');
    setShowCustomInput(false);
    setError('');
    setSuccess(false);

    setIsFetching(true);
    goalsService.getAll()
      .then(data => {
        // Only show active/in-progress goals
        const active = (data || []).filter(g =>
          g.status === 'ACTIVE' ||
          g.status === 'IN_PROGRESS' ||
          g.status === 'in_progress' ||
          !g.status
        );
        setGoals(active);
      })
      .catch(() => setGoals([]))
      .finally(() => setIsFetching(false));
  }, [isOpen, transactionData]);

  // ── Close on ESC ───────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleGoalSelect = (goalId) => {
    setSelectedGoalId(goalId);
    setShowCustomInput(false);
    setCustomGoal('');
    setError('');
  };

  const handleCustomSelect = () => {
    setSelectedGoalId('custom');
    setShowCustomInput(true);
    setError('');
  };

  const handleSubmit = async () => {
    // Determine the hint to send — either the goal's name or custom text
    let goalHint = '';
    if (selectedGoalId === 'custom') {
      goalHint = customGoal.trim();
    } else {
      const found = goals.find(g => g.goalId === selectedGoalId || g.id === selectedGoalId);
      goalHint = found?.goalName || found?.name || '';
    }

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
        if (onSave) onSave(result);
        setTimeout(() => onClose(), 1500);
      } else {
        setError(result?.message || `No goal matched "${goalHint}". Make sure the goal is active.`);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('assignGoalToTransaction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);

  const formatProgress = (goal) => {
    const current = parseFloat(goal.currentAmount || goal.savedAmount || 0);
    const target  = parseFloat(goal.targetAmount || goal.target || 1);
    const pct     = Math.min(100, Math.round((current / target) * 100));
    return { current, target, pct };
  };

  const isSubmitDisabled =
    !selectedGoalId ||
    (selectedGoalId === 'custom' && !customGoal.trim()) ||
    isLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="savings-modal-overlay" onClick={onClose}>
          <motion.div
            className="savings-modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="savings-modal-close" onClick={onClose}>
              <FiX />
            </button>

            <div className="savings-modal-icon">
              <FiSave />
            </div>

            {success ? (
              // ── Success state ────────────────────────────────────
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1  }}
                className="savings-success-state"
              >
                <div className="savings-success-icon">🎯</div>
                <h2 className="savings-modal-title">Goal Updated!</h2>
                <p className="savings-modal-subtitle">
                  {formatAmount(transactionData?.amount || 0)} has been added to your goal.
                </p>
              </motion.div>
            ) : (
              // ── Selection state ──────────────────────────────────
              <>
                <h2 className="savings-modal-title">Savings Detected! 🎯</h2>
                <p className="savings-modal-subtitle">
                  We noticed a savings transaction of{' '}
                  <strong>{formatAmount(transactionData?.amount || 0)}</strong>.
                  {transactionData?.suggestedGoal && (
                    <> Looks like it might be for <strong>{transactionData.suggestedGoal}</strong>.</>
                  )}
                </p>

                <p className="savings-modal-question">Which goal is this for?</p>

                {error && (
                  <motion.p
                    className="savings-modal-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ⚠️ {error}
                  </motion.p>
                )}

                {/* ── Goals list ── */}
                <div className="savings-goals-list">
                  {isFetching ? (
                    <div className="savings-fetching">
                      <span className="savings-spinner"></span>
                      <span>Loading your goals...</span>
                    </div>
                  ) : goals.length === 0 ? (
                    <p className="savings-no-goals">
                      No active goals found. Create a goal first in the Goals page, or use a custom name below.
                    </p>
                  ) : (
                    goals.map(goal => {
                      const id  = goal.goalId || goal.id;
                      const { current, target, pct } = formatProgress(goal);
                      const isSelected = selectedGoalId === id;

                      return (
                        <button
                          key={id}
                          className={`savings-goal-row ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleGoalSelect(id)}
                        >
                          <div className="goal-row-left">
                            <span className="goal-row-name">{goal.goalName || goal.name}</span>
                            <div className="goal-row-progress-bar">
                              <div
                                className="goal-row-progress-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="goal-row-amounts">
                              KES {current.toLocaleString()} / KES {target.toLocaleString()} ({pct}%)
                            </span>
                          </div>
                          {isSelected && <FiCheck className="goal-row-check" />}
                        </button>
                      );
                    })
                  )}

                  {/* Custom goal option */}
                  <button
                    className={`savings-goal-row custom-row ${selectedGoalId === 'custom' ? 'selected' : ''}`}
                    onClick={handleCustomSelect}
                  >
                    <div className="goal-row-left">
                      <span className="goal-row-name">
                        <FiPlus style={{ marginRight: 6 }} />
                        Use a different goal name
                      </span>
                    </div>
                    {selectedGoalId === 'custom' && <FiCheck className="goal-row-check" />}
                  </button>
                </div>

                {/* Custom input */}
                {showCustomInput && (
                  <motion.div
                    className="savings-custom-input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{    opacity: 0, height: 0    }}
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

                {/* Action buttons */}
                <div className="savings-modal-actions">
                  <button className="savings-skip-btn" onClick={onClose}>
                    Skip for now
                  </button>
                  <button
                    className={`savings-save-btn ${isSubmitDisabled ? 'disabled' : ''}`}
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
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
                  This will help us track your progress in Goals &amp; Budgets.
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