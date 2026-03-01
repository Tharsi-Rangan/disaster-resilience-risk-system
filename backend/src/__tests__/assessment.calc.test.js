const {
  clamp,
  levelFromScore,
  calcWeatherScore,
  calcEarthquakeScore,
  calcFloodBase,
  adjustFloodByElevation,
  calcRiskScore,
} = require("../utils/assessment.calc");

describe("Component 3 Unit Tests - assessment.calc", () => {
  test("clamp should keep values between 0 and 100", () => {
    expect(clamp(-10)).toBe(0);
    expect(clamp(0)).toBe(0);
    expect(clamp(55)).toBe(55);
    expect(clamp(100)).toBe(100);
    expect(clamp(1000)).toBe(100);
  });

  test("levelFromScore should return correct risk level", () => {
    expect(levelFromScore(0)).toBe("LOW");
    expect(levelFromScore(39)).toBe("LOW");
    expect(levelFromScore(40)).toBe("MEDIUM");
    expect(levelFromScore(69)).toBe("MEDIUM");
    expect(levelFromScore(70)).toBe("HIGH");
    expect(levelFromScore(100)).toBe("HIGH");
  });

  test("calcWeatherScore should compute using rainfall and windSpeed", () => {
    const snapshot = { rainfall: 25, windSpeed: 10 };
    const score = calcWeatherScore(snapshot);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test("calcEarthquakeScore should map earthquakeCount to 0..100", () => {
    expect(calcEarthquakeScore({ earthquakeCount: 0 })).toBe(0);
    expect(calcEarthquakeScore({ earthquakeCount: 5 })).toBe(50);
    expect(calcEarthquakeScore({ earthquakeCount: 10 })).toBe(100);
    expect(calcEarthquakeScore({ earthquakeCount: 20 })).toBe(100); // clamped
  });

  test("calcFloodBase should return floodRiskIndex clamped", () => {
    expect(calcFloodBase({ floodRiskIndex: 30 })).toBe(30);
    expect(calcFloodBase({ floodRiskIndex: 150 })).toBe(100);
    expect(calcFloodBase({})).toBe(0);
  });

  test("adjustFloodByElevation should add bonus for low elevation", () => {
    expect(adjustFloodByElevation(50, 10)).toBe(65);  // +15
    expect(adjustFloodByElevation(50, 50)).toBe(58);  // +8
    expect(adjustFloodByElevation(50, 150)).toBe(50); // +0
    expect(adjustFloodByElevation(50, null)).toBe(50); // no elevation
  });

  test("calcRiskScore should apply 30/40/30 weighting correctly", () => {
    // 30*0.3=9, 60*0.4=24, 10*0.3=3 => 36
    const risk = calcRiskScore({
      weatherScore: 30,
      floodScore: 60,
      earthquakeScore: 10,
    });
    expect(risk).toBe(36);
  });

  test("calcRiskScore stays in 0..100", () => {
    const risk = calcRiskScore({
      weatherScore: 100,
      floodScore: 100,
      earthquakeScore: 100,
    });
    expect(risk).toBe(100);

    const risk2 = calcRiskScore({
      weatherScore: -50,
      floodScore: 999,
      earthquakeScore: 0,
    });
    expect(risk2).toBeGreaterThanOrEqual(0);
    expect(risk2).toBeLessThanOrEqual(100);
  });
});