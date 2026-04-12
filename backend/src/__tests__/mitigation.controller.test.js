// backend/src/__tests__/mitigation.controller.test.js
// Unit tests for the updateRecommendation controller in mitigation.controller.js
// Uses manual req/res mocks — no Express server, no MongoDB connection needed.

// ── Helpers ────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ── Shared test data ───────────────────────────────────────────────────────
const userId = '64a000000000000000000001';
const planId  = '64a000000000000000000010';
const recId   = '64a000000000000000000020';

// Build a fake plan that simulates Mongoose subdocument behaviour.
// The key is implementing `.recommendations.id()` which is what the controller calls.
const makePlan = (recStatus = 'PENDING', totalRecs = 1) => {
  const recs = Array.from({ length: totalRecs }, (_, i) => ({
    _id: { toString: () => (i === 0 ? recId : `fake-id-${i}`) },
    status: i === 0 ? recStatus : 'PENDING',
    actionNote: '',
    updatedBy: null,
    updatedAt: null,
  }));

  const plan = {
    _id: planId,
    recommendations: recs,
    planStatus: 'PENDING',
    completedCount: 0,
    ongoingCount: 0,
    pendingCount: totalRecs,
    totalRecommendations: totalRecs,
    save: jest.fn().mockResolvedValue(true),
    populate: jest.fn().mockResolvedValue(true),
  };

  // Simulate Mongoose's subdocument `.id()` method
  plan.recommendations.id = (id) =>
    recs.find((r) => r._id.toString() === id) || null;

  return plan;
};

// ── Mock MitigationPlan Mongoose model ────────────────────────────────────
jest.mock('../models/MitigationPlan', () => ({
  findById: jest.fn(),
}));

const MitigationPlan = require('../models/MitigationPlan');
const { updateRecommendation } = require('../controllers/mitigation.controller');

// ── Tests ─────────────────────────────────────────────────────────────────
describe('Component 5 Unit Tests - updateRecommendation controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 404 when the mitigation plan does not exist', async () => {
    MitigationPlan.findById.mockResolvedValue(null);

    const req = {
      params: { planId, recId },
      body: { status: 'ONGOING' },
      user: { _id: userId },
    };
    const res = mockRes();

    await updateRecommendation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  test('returns 404 when the recommendation ID does not exist inside the plan', async () => {
    const plan = makePlan();
    MitigationPlan.findById.mockResolvedValue(plan);

    const req = {
      params: { planId, recId: 'non-existent-rec-id' },
      body: { status: 'ONGOING' },
      user: { _id: userId },
    };
    const res = mockRes();

    await updateRecommendation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updates recommendation status and stamps updatedBy with current user ID', async () => {
    const plan = makePlan('PENDING');
    MitigationPlan.findById.mockResolvedValue(plan);

    const req = {
      params: { planId, recId },
      body: { status: 'ONGOING' },
      user: { _id: userId },
    };
    const res = mockRes();

    await updateRecommendation(req, res);

    const rec = plan.recommendations[0];
    expect(rec.status).toBe('ONGOING');
    expect(rec.updatedBy).toBe(userId);
  });

  test('updates actionNote when provided in the request body', async () => {
    const plan = makePlan('PENDING');
    MitigationPlan.findById.mockResolvedValue(plan);

    const req = {
      params: { planId, recId },
      body: { status: 'ONGOING', actionNote: 'Materials delivered on site' },
      user: { _id: userId },
    };
    const res = mockRes();

    await updateRecommendation(req, res);

    expect(plan.recommendations[0].actionNote).toBe('Materials delivered on site');
  });

  test('auto-sets planStatus to COMPLETED when all recommendations are COMPLETED', async () => {
    const plan = makePlan('PENDING', 1);
    MitigationPlan.findById.mockResolvedValue(plan);

    const req = {
      params: { planId, recId },
      body: { status: 'COMPLETED' },
      user: { _id: userId },
    };
    const res = mockRes();

    await updateRecommendation(req, res);

    expect(plan.planStatus).toBe('COMPLETED');
    expect(plan.completedCount).toBe(1);
  });

  test('auto-sets planStatus to IN_PROGRESS when some tasks are ONGOING', async () => {
    const plan = makePlan('PENDING', 2);
    MitigationPlan.findById.mockResolvedValue(plan);

    const req = {
      params: { planId, recId },
      body: { status: 'ONGOING' },
      user: { _id: userId },
    };
    const res = mockRes();

    await updateRecommendation(req, res);

    expect(plan.planStatus).toBe('IN_PROGRESS');
    expect(plan.ongoingCount).toBe(1);
  });

  test('calls plan.save() to persist changes to the database', async () => {
    const plan = makePlan('PENDING');
    MitigationPlan.findById.mockResolvedValue(plan);

    const req = {
      params: { planId, recId },
      body: { status: 'COMPLETED' },
      user: { _id: userId },
    };
    const res = mockRes();

    await updateRecommendation(req, res);

    expect(plan.save).toHaveBeenCalledTimes(1);
  });

  test('returns success response with updated mitigationPlan on completion', async () => {
    const plan = makePlan('PENDING');
    MitigationPlan.findById.mockResolvedValue(plan);

    const req = {
      params: { planId, recId },
      body: { status: 'COMPLETED' },
      user: { _id: userId },
    };
    const res = mockRes();

    await updateRecommendation(req, res);

    // Controller calls res.json() directly (Express defaults to 200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mitigationPlan: expect.anything() })
    );
  });
});
