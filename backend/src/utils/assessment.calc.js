// backend/src/utils/assessment.calc.js

const clamp = (n) => Math.max(0, Math.min(100, Number(n || 0)));

const levelFromScore = (score) => {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
};

// Uses Component 2 snapshot fields
const calcWeatherScore = (snapshot) => {
  const rain = Number(snapshot.rainfall || 0);
  const wind = Number(snapshot.windSpeed || 0);

  const rainScore = clamp((rain / 50) * 100); // 50mm => 100
  const windScore = clamp((wind / 25) * 100); // 25 m/s => 100

  return clamp(Math.round(rainScore * 0.6 + windScore * 0.4));
};

const calcEarthquakeScore = (snapshot) => {
  const count = Number(snapshot.earthquakeCount || 0);
  return clamp(Math.round((count / 10) * 100)); // 10+ => 100
};

const calcFloodBase = (snapshot) => clamp(snapshot.floodRiskIndex || 0);

const adjustFloodByElevation = (floodBase, elevation) => {
  if (typeof elevation !== "number") return clamp(floodBase);

  let bonus = 0;
  if (elevation < 20) bonus = 15;
  else if (elevation < 100) bonus = 8;

  return clamp(Math.round(floodBase + bonus));
};

const calcRiskScore = ({ weatherScore, floodScore, earthquakeScore }) => {
  return clamp(
    Math.round(weatherScore * 0.3 + floodScore * 0.4 + earthquakeScore * 0.3)
  );
};

module.exports = {
  clamp,
  levelFromScore,
  calcWeatherScore,
  calcEarthquakeScore,
  calcFloodBase,
  adjustFloodByElevation,
  calcRiskScore,
};