import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiX, FiSave, FiTrendingUp, FiHome, FiBriefcase, FiShoppingBag, FiHeart, FiBook, FiCheck } from 'react-icons/fi';
import './SavingsPromptModal.css';

const SavingsPromptModal = ({ isOpen, onClose, transactionData, onSave }) => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const predefinedGoals = [
    { id: 'emergency', label: 'Emergency Fund', icon: <FiSave />, color: '#2DD4BF' },
    { id: 'vacation', label: 'Vacation', icon: <FiTrendingUp />, color: '#F59E0B' },
    { id: 'housing', label: 'Housing / Rent', icon: <FiHome />, color: '#3B82F6' },
    { id: 'business', label: 'Business Investment', icon: <FiBriefcase />, color: '#8B5CF6' },
    { id: 'shopping', label: 'Shopping', icon: <FiShoppingBag />, color: '#EC4899' },
    { id: 'education', label: 'Education Fund', icon: <FiBook />, color: '#10B981' },
    { id: 'charity', label: 'Charity / Giving', icon: <FiHeart />, color: '#EF4444' },
  ];

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
    setShowCustomInput(false);
    setCustomGoal('');
  };

  const handleCustomSelect = () => {
    setShowCustomInput(true);
    setSelectedGoal('custom');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    const goalName = selectedGoal === 'custom' ? customGoal : predefinedGoals.find(g => g.id === selectedGoal)?.label;
    
    if (!goalName) {
      setIsLoading(false);
      return;
    }

    try {
      await onSave(transactionData, goalName);
      setTimeout(() => {
        onClose();
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error saving goal:', error);
      setIsLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
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

            {/* Title */}
            <h2 className="savings-modal-title">
              Savings Detected! 🎯
            </h2>

            <p className="savings-modal-subtitle">
              We noticed a savings transaction of{' '}
              <strong>{formatAmount(transactionData?.amount || 0)}</strong> from{' '}
              <strong>{transactionData?.source || 'M-Shwari / ZIDII'}</strong>.
            </p>

            <p className="savings-modal-question">
              What are you saving toward?
            </p>

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
              
              {/* Custom Goal Option */}
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
                disabled={(!selectedGoal || (selectedGoal === 'custom' && !customGoal)) || isLoading}
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
              This will help us track your progress in Goals & Budgets and improve your financial insights.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SavingsPromptModal;