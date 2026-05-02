import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiPhone, FiShield, FiCheckCircle, FiSmartphone } from 'react-icons/fi';
import './DownloadAPKModal.css';

const DownloadAPKModal = ({ isOpen, onClose, userName = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Check if user has already been prompted
      const hasSeenModal = localStorage.getItem('apk_modal_shown');
      if (hasSeenModal === 'true') {
        onClose();
      }
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    const apkUrl = 'https://your-domain.com/downloads/finlytics-app.apk';
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'finlytics-app.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mark that user has seen the modal
    localStorage.setItem('apk_modal_shown', 'true');
    
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleRemindLater = () => {
    // Don't mark as seen, just close
    handleClose();
  };

  const features = [
    { icon: <FiShield />, text: 'Read-only access — we never move your money' },
    { icon: <FiCheckCircle />, text: 'End-to-end encrypted connection' },
    { icon: <FiSmartphone />, text: 'Real-time transaction sync' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="apk-modal-overlay" onClick={handleClose}>
          <motion.div
            className="apk-modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className="apk-modal-close" onClick={handleClose}>
              <FiX />
            </button>

            {/* Icon */}
            <div className="apk-modal-icon">
              <FiPhone />
            </div>

            {/* Title */}
            <h2 className="apk-modal-title">
              Connect Your M-Pesa
            </h2>

            <p className="apk-modal-subtitle">
              {userName ? `Hey ${userName}! 👋` : 'Hey there! 👋'} 
              To get started with automatic transaction tracking, you'll need to install our secure companion app.
            </p>

            {/* Features list */}
            <div className="apk-modal-features">
              {features.map((feature, index) => (
                <div key={index} className="apk-modal-feature">
                  <span className="apk-modal-feature-icon">{feature.icon}</span>
                  <span className="apk-modal-feature-text">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Download button */}
            <button 
              className={`apk-modal-download-btn ${downloadStarted ? 'downloading' : ''}`}
              onClick={handleDownload}
              disabled={downloadStarted}
            >
              {downloadStarted ? (
                <>
                  <span className="apk-modal-spinner"></span>
                  Downloading...
                </>
              ) : (
                <>
                  <FiDownload />
                  Download APK
                </>
              )}
            </button>

            {/* Remind later link */}
            <button className="apk-modal-remind-later" onClick={handleRemindLater}>
              Remind me later
            </button>

            {/* Security note */}
            <p className="apk-modal-security-note">
              <FiShield size={12} /> Your data is protected with bank-grade encryption
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DownloadAPKModal;