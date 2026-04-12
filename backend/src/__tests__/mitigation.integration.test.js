// backend/src/__tests__/mitigation.integration.test.js
// Integration tests for Mitigation API endpoints using Supertest.
// The full HTTP stack is exercised: routing, auth middleware, RBAC, controllers, and MongoDB.

const request = require('supertest');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const app     = require('../../src/app');
const User    = require('../models/User');
const Project = require('../models/Project');
const RiskAssessment = require('../models/RiskAssessment');

// ── Mock Gemini AI — prevents real API calls during tests ─────────────────
jest.mock('../services/ai/gemini.service', () => ({
  geminiGenerateMitigation: jest.fn().mockResolvedValue({
    priorityLevel: 'HIGH',
    recommendations: [
      { title: 'Improve Drainage System', details: 'Install stormwater channels.',    category: 'FLOOD'       },
      { title: 'Reinforce Structure',     details: 'Use quake-resistant materials.',  category: 'EARTHQUAKE'  },
      { title: 'Weatherproof Roofing',    details: 'Apply protective coatings.',      category: 'WEATHER'     },
      { title: 'Emergency Response Plan', details: 'Evacuation routes established.',  category: 'GENERAL'     },
      { title: 'Staff Safety Training',   details: 'Run monthly safety drills.',      category: 'GENERAL'     },
    ],
  }),
  geminiChatResponse: jest.fn().mockResolvedValue('Here is my AI advice.'),
}));

// ── Shared state ──────────────────────────────────────────────────────────
let adminToken, contractorToken;
let project, plan;

// ── Setup: runs ONCE before all tests in this suite ──────────────────────
// NOTE: we use beforeEach in setup.js to wipe the DB, so we re-seed here
// using beforeAll which runs BEFORE the individual tests but AFTER our
// global beforeAll in setup.js creates the in-memory server.

beforeAll(async () => {
  const hash = await bcrypt.hash('TestPass123!', 10);

  const adminUser = await User.create({
    name: 'Admin Tester',
    email: 'admin.integration@test.com',
    password: hash,
    role: 'ADMIN',
    isVerified: true,
  });

  const contractorUser = await User.create({
    name: 'Contractor Tester',
    email: 'contractor.integration@test.com',
    password: hash,
    role: 'CONTRACTOR',
    isVerified: true,
  });

  adminToken      = jwt.sign({ userId: adminUser._id      }, process.env.JWT_SECRET);
  contractorToken = jwt.sign({ userId: contractorUser._id }, process.env.JWT_SECRET);

  project = await Project.create({
    title: 'Kelani Bridge Renovation',
    description: 'Flood risk mitigation project',
    projectType: 'bridge',
    location: { address: 'Colombo, Sri Lanka', lat: 6.9271, lng: 79.8612 },
    createdBy: contractorUser._id,
  });

  // The generate endpoint requires a RiskAssessment to exist for the project
  await RiskAssessment.create({
    projectId: project._id,
    riskScore: 72,
    riskLevel: 'HIGH',
    weatherScore: 60,
    floodScore: 80,
    earthquakeScore: 50,
    modelVersion: 'v1',
  });
});

// ── Override afterEach from global setup to avoid wiping between our tests ─
// We need our users/project to persist across all tests in this file.
// The global setup.js afterEach wipes the DB — we prevent that by restoring
// data here. However, the simplest fix is a local afterAll cleanup instead.
afterEach(() => {
  // Intentionally empty — we manage cleanup in afterAll for integration tests
  // to preserve seeded users and project across all test cases in this suite.
});

// ── Test Suite ─────────────────────────────────────────────────────────────
describe('Mitigation API — Integration Tests (Component 5)', () => {

  // ── AUTH PROTECTION ──────────────────────────────────────────────────────

  test('GET /:projectId/latest → 401 when no auth token is provided', async () => {
    const res = await request(app).get(`/api/mitigation/${project._id}/latest`);
    expect(res.statusCode).toBe(401);
  });

  test('GET /:projectId/latest → 404 when no plan exists yet for the project', async () => {
    const res = await request(app)
      .get(`/api/mitigation/${project._id}/latest`)
      .set('Authorization', `Bearer ${contractorToken}`);
    expect(res.statusCode).toBe(404);
  });

  // ── GENERATE PLAN ─────────────────────────────────────────────────────────

  test('POST /generate/:projectId → 201 creates AI mitigation plan with recommendations', async () => {
    const res = await request(app)
      .post(`/api/mitigation/generate/${project._id}`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({});

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mitigationPlan');
    expect(res.body.mitigationPlan.recommendations.length).toBe(5);

    plan = res.body.mitigationPlan; // used by subsequent tests
  });

  test('POST /generate/:projectId → 401 without auth token', async () => {
    const res = await request(app)
      .post(`/api/mitigation/generate/${project._id}`)
      .send({});
    expect(res.statusCode).toBe(401);
  });

  // ── GET LATEST ────────────────────────────────────────────────────────────

  test('GET /:projectId/latest → 200 returns the generated plan after creation', async () => {
    const res = await request(app)
      .get(`/api/mitigation/${project._id}/latest`)
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.mitigationPlan).toBeDefined();
    expect(res.body.mitigationPlan._id).toBe(plan._id);
  });

  // ── GET HISTORY ───────────────────────────────────────────────────────────

  test('GET /:projectId/history → 200 returns array of plans', async () => {
    const res = await request(app)
      .get(`/api/mitigation/${project._id}/history`)
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.mitigationPlans)).toBe(true);
    expect(res.body.mitigationPlans.length).toBeGreaterThanOrEqual(1);
  });

  // ── PATCH RECOMMENDATION ──────────────────────────────────────────────────

  test('PATCH /:planId/recommendations/:recId → 200 updates status and actionNote (audit trail)', async () => {
    const recId = plan.recommendations[0]._id;

    const res = await request(app)
      .patch(`/api/mitigation/${plan._id}/recommendations/${recId}`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({ status: 'ONGOING', actionNote: 'Materials ordered and delivered' });

    expect(res.statusCode).toBe(200);
    const updated = res.body.mitigationPlan.recommendations.find(r => r._id === recId);
    expect(updated.status).toBe('ONGOING');
    expect(updated.actionNote).toBe('Materials ordered and delivered');
    expect(updated.updatedBy).toBeDefined(); // audit trail populated
  });

  test('PATCH /:planId/recommendations/:recId → 404 for non-existent recommendation', async () => {
    const fakeRecId = '64a000000000000000000099';

    const res = await request(app)
      .patch(`/api/mitigation/${plan._id}/recommendations/${fakeRecId}`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({ status: 'ONGOING' });

    expect(res.statusCode).toBe(404);
  });

  // ── RBAC ──────────────────────────────────────────────────────────────────

  test('GET /all → 200 for ADMIN — returns all plans across all projects', async () => {
    const res = await request(app)
      .get('/api/mitigation/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.mitigationPlans)).toBe(true);
  });

  test('GET /all → 403 for CONTRACTOR — admin-only route denied', async () => {
    const res = await request(app)
      .get('/api/mitigation/all')
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(403);
  });

  // ── DELETE RECOMMENDATION ─────────────────────────────────────────────────

  test('DELETE /:planId/recommendations/:recId → 200 removes one recommendation', async () => {
    const recId = plan.recommendations[plan.recommendations.length - 1]._id;

    const res = await request(app)
      .delete(`/api/mitigation/${plan._id}/recommendations/${recId}`)
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(200);
    const ids = res.body.mitigationPlan.recommendations.map(r => r._id);
    expect(ids).not.toContain(recId);
  });

  // ── DELETE PLAN ───────────────────────────────────────────────────────────

  test('DELETE /:id → 403 for CONTRACTOR — only admin can delete plans', async () => {
    const res = await request(app)
      .delete(`/api/mitigation/${plan._id}`)
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('DELETE /:id → 200 for ADMIN — plan successfully deleted', async () => {
    const res = await request(app)
      .delete(`/api/mitigation/${plan._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });
});
