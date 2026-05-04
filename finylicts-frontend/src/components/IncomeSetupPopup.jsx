import { useState, useEffect } from 'react';
import { incomeProfileService } from '../service/api';

const IncomeSetupPopup = ({ onComplete }) => {
  const [income, setIncome]   = useState('');
  const [error, setError]     = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    incomeProfileService.get()
      .then(data => {
        // If null or no data returned, show popup
        if (!data) setVisible(true);
      })
      .catch(() => setVisible(true)); // 404 throws in your request helper → show popup
  }, []);

  const handleSave = async () => {
    if (!income || isNaN(income) || Number(income) <= 0) {
      setError(true);
      return;
    }
    try {
      await incomeProfileService.create({ declaredMonthlyIncome: Number(income) });
      setVisible(false);
      onComplete?.();
    } catch {
      setError(true);
    }
  };

  if (!visible) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-icon">💰</div>
        <h3>Set your monthly income</h3>
        <p>Helps us calculate your savings rate and financial health score</p>
        <div className="popup-input-wrapper">
          <span className="popup-currency">KSh</span>
          <input
            type="number"
            placeholder="e.g. 85000"
            value={income}
            onChange={e => { setIncome(e.target.value); setError(false); }}
            className={error ? 'input-error' : ''}
          />
        </div>
        {error && <span className="error-text">Please enter a valid amount</span>}
        <div className="popup-actions">
          <button onClick={() => setVisible(false)}>Skip for now</button>
          <button onClick={handleSave} className="primary">Save income</button>
        </div>
      </div>
    </div>
  );
};

export default IncomeSetupPopup;