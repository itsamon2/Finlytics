import "./MetricCard.css";

const MetricCard = ({
  title,
  value = 0,
  target = 100,
  icon,
  warning
}) => {

  const percentage =
    target > 0
      ? Math.min((value / target) * 100, 100)
      : 0;

  return (
    <div
      className={`metric-card ${
        warning ? "warning" : ""
      }`}
    >

      <div className="metric-header">

        <div className="icon">
          {icon}
        </div>

        <div>
          <h4>{title}</h4>
          <h2>{value}%</h2>
        </div>

      </div>

      <div className="progress-bar">

        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="target">
        Target: {target}%
      </p>

    </div>
  );
};

export default MetricCard;