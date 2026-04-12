// backend/src/__tests__/mitigation.service.test.js
// Unit tests for the rule-based fallback engine in mitigation.service.js
// All external dependencies (Gemini AI, MongoDB) are mocked so no database is needed.

// Mock the Gemini AI module so it never makes real API calls
jest.mock('../services/ai/gemini.service', () => ({
  geminiGenerateMitigation: jest.fn(),
}));

// Mock RiskAssessment model (imported by service but not used in rule-based path)
jest.mock('../models/RiskAssessment', () => ({}));

const { buildMitigationPlan } = require('../services/mitigation.service');

describe('Component 5 Unit Tests - mitigation.service (rule-based engine)', () => {

  beforeEach(() => {
    // Ensure AI_PROVIDER is NOT set to GEMINI so we always test the rule-based fallback
    process.env.AI_PROVIDER = 'NONE';
  });

  // ─── normalizeRecommendations (via buildMitigationPlan output) ─────────────

  test('always returns exactly 5 recommendations regardless of scores', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'LOW',
      riskScore: 5,
      floodScore: 0,
      earthquakeScore: 0,
      weatherScore: 0,
    });
    expect(result.recommendations).toHaveLength(5);
  });

  test('all recommendations have required fields: title, details, category, status', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'LOW',
      riskScore: 10,
      floodScore: 0,
      earthquakeScore: 0,
      weatherScore: 0,
    });
    result.recommendations.forEach((rec) => {
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('details');
      expect(rec).toHaveProperty('category');
      expect(rec).toHaveProperty('status', 'PENDING');
    });
  });

  // ─── Flood threshold rule ──────────────────────────────────────────────────

  test('floodScore > 20 → includes "Improve Drainage System" recommendation', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'HIGH',
      riskScore: 80,
      floodScore: 60,
      earthquakeScore: 0,
      weatherScore: 0,
    });
    const titles = result.recommendations.map((r) => r.title);
    expect(titles).toContain('Improve Drainage System');
  });

  test('floodScore <= 20 → does NOT include "Improve Drainage System"', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'LOW',
      riskScore: 10,
      floodScore: 10,
      earthquakeScore: 0,
      weatherScore: 0,
    });
    const titles = result.recommendations.map((r) => r.title);
    expect(titles).not.toContain('Improve Drainage System');
  });

  // ─── Earthquake threshold rule ─────────────────────────────────────────────

  test('earthquakeScore > 20 → includes "Reinforce Structural Design" recommendation', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'HIGH',
      riskScore: 75,
      floodScore: 0,
      earthquakeScore: 50,
      weatherScore: 0,
    });
    const titles = result.recommendations.map((r) => r.title);
    expect(titles).toContain('Reinforce Structural Design');
  });

  test('earthquakeScore <= 20 → does NOT include "Reinforce Structural Design"', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'LOW',
      riskScore: 5,
      floodScore: 0,
      earthquakeScore: 5,
      weatherScore: 0,
    });
    const titles = result.recommendations.map((r) => r.title);
    expect(titles).not.toContain('Reinforce Structural Design');
  });

  // ─── Weather threshold rule ────────────────────────────────────────────────

  test('weatherScore > 15 → includes "Weatherproof Infrastructure" recommendation', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'MEDIUM',
      riskScore: 45,
      floodScore: 0,
      earthquakeScore: 0,
      weatherScore: 40,
    });
    const titles = result.recommendations.map((r) => r.title);
    expect(titles).toContain('Weatherproof Infrastructure');
  });

  test('weatherScore <= 15 → does NOT include "Weatherproof Infrastructure"', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'LOW',
      riskScore: 5,
      floodScore: 0,
      earthquakeScore: 0,
      weatherScore: 5,
    });
    const titles = result.recommendations.map((r) => r.title);
    expect(titles).not.toContain('Weatherproof Infrastructure');
  });

  // ─── Priority level & AI provider ─────────────────────────────────────────

  test('riskLevel is correctly used as priorityLevel in rule-based mode', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'MEDIUM',
      riskScore: 50,
      floodScore: 0,
      earthquakeScore: 0,
      weatherScore: 0,
    });
    expect(result.priorityLevel).toBe('MEDIUM');
  });

  test('aiProvider is "NONE" when AI_PROVIDER env is not GEMINI', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'LOW',
      riskScore: 10,
      floodScore: 0,
      earthquakeScore: 0,
      weatherScore: 0,
    });
    expect(result.aiProvider).toBe('NONE');
  });

  // ─── All three risk factors high ───────────────────────────────────────────

  test('high scores on all three factors → all three domain recommendations appear', async () => {
    const result = await buildMitigationPlan({
      riskLevel: 'HIGH',
      riskScore: 95,
      floodScore: 80,
      earthquakeScore: 70,
      weatherScore: 60,
    });
    const titles = result.recommendations.map((r) => r.title);
    expect(titles).toContain('Improve Drainage System');
    expect(titles).toContain('Reinforce Structural Design');
    expect(titles).toContain('Weatherproof Infrastructure');
    expect(result.recommendations).toHaveLength(5);
  });
});
