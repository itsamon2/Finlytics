import { useState } from "react";
import { incomeProfileService } from "../service/api";
import "./IncomeProfileModal.css";

const IncomeProfileModal = ({ existing, onClose, onSaved }) => {
  const [income, setIncome] = useState(existing?.declaredMonthlyIncome ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSave = async () => {
    if (!income || isNaN(income)) return setError("Enter a valid amount");
    setLoading(true);
    try {
      const payload = { declaredMonthlyIncome: parseFloat(income) };
      const saved = existing
        ? await incomeProfileService.update(payload)
        : await incomeProfileService.create(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{existing ? "Update" : "Set"} Monthly Income</h3>
        <p>This is used to calculate your estimated tax.</p>

        <label>Declared Monthly Income (KSh)</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="e.g. 80000"
        />

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeProfileModal;