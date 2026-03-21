import "./HealthScoreCard.css";
const HealthScoreCard = ({ score, description }) => {
  return (
    <div className="health-score-card">
      <p>Financial Health Score</p>
      <div className="score">{score}</div>
      <p>{description}</p>
    </div>
  );
};


export default HealthScoreCard;