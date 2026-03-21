import "./MetricCard.css";

const MetricCard = ({ title, value, target, icon, color }) => {
  const percentage = (value / target) * 100;

  return (
    <div className="metric-card">
      <div className="metric-header">
        <div className="icon">{icon}</div>
        <div>
          <h4>{title}</h4>
          <h2 style={{ color }}>{value}%</h2>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <p className="target">Target: {target}%</p>
    </div>
  );
};

export default MetricCard;