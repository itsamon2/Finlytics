import "./HealthScoreCard.css";

const HealthScoreCard = ({
  score = 0,
  description = "No data available"
}) => {

  return (
    <div className="health-score-card">

      <p className="label">
        Financial Health Score
      </p>

      <div className="score">
        {score}
      </div>

      <p className="description">
        {description}
      </p>

    </div>
  );
};

export default HealthScoreCard;