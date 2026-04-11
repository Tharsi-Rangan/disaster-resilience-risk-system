const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

jest.mock("../src/services/riskData.service", () => ({
  createSnapshot: jest.fn(),
  getLatestSnapshot: jest.fn(),
  getSnapshotHistory: jest.fn(),
  deleteSnapshot: jest.fn(),
}));

const app = require("../src/app");
const riskDataService = require("../src/services/riskData.service");
const User = require("../src/models/User");
const Project = require("../src/models/Project");

describe("Risk Data API Tests", () => {
  let contractorToken;
  let adminToken;
  let project;

  beforeEach(async () => {
    jest.clearAllMocks();

    const contractor = await User.create({
      name: "Contractor",
      email: "contractor.risk@test.com",
      password: "123456",
      role: "CONTRACTOR",
    });

    const admin = await User.create({
      name: "Admin",
      email: "admin.risk@test.com",
      password: "123456",
      role: "ADMIN",
    });

    contractorToken = jwt.sign({ userId: contractor._id }, process.env.JWT_SECRET);
    adminToken = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET);

    project = await Project.create({
      title: "Risk Data Project",
      projectType: "road",
      location: {
        address: "Colombo, Sri Lanka",
        lat: 6.9271,
        lng: 79.8612,
      },
      createdBy: contractor._id,
    });
  });

  test("GET /api/risk-data/:projectId/latest returns 401 without token", async () => {
    const res = await request(app).get(`/api/risk-data/${project._id}/latest`);

    expect(res.statusCode).toBe(401);
  });

  test("GET /api/risk-data/:projectId/latest returns 400 for invalid projectId", async () => {
    const res = await request(app)
      .get("/api/risk-data/not-a-mongo-id/latest")
      .set("Authorization", `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test("GET /api/risk-data/:projectId/latest returns 404 when no snapshot exists", async () => {
    riskDataService.getLatestSnapshot.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/risk-data/${project._id}/latest`)
      .set("Authorization", `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/no snapshots found/i);
  });

  test("GET /api/risk-data/:projectId/latest returns latest snapshot for contractor", async () => {
    const snapshot = {
      _id: new mongoose.Types.ObjectId(),
      projectId: project._id,
      temperature: 28,
      fetchedAt: new Date(),
    };

    riskDataService.getLatestSnapshot.mockResolvedValue(snapshot);

    const res = await request(app)
      .get(`/api/risk-data/${project._id}/latest`)
      .set("Authorization", `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.snapshot).toBeDefined();
    expect(riskDataService.getLatestSnapshot).toHaveBeenCalledWith(String(project._id));
  });

  test("POST /api/risk-data/fetch/:projectId uses project fallback location and returns 201", async () => {
    const created = {
      _id: new mongoose.Types.ObjectId(),
      projectId: project._id,
      temperature: 29,
      humidity: 82,
      floodRiskIndex: 44,
      source: "OpenWeather/USGS",
      fetchedAt: new Date(),
    };

    riskDataService.createSnapshot.mockResolvedValue(created);

    const res = await request(app)
      .post(`/api/risk-data/fetch/${project._id}`)
      .set("Authorization", `Bearer ${contractorToken}`)
      .send({});

    expect(res.statusCode).toBe(201);
    expect(res.body.snapshot).toBeDefined();
    expect(riskDataService.createSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: String(project._id),
        lat: 6.9271,
        lng: 79.8612,
      })
    );
  });

  test("GET /api/risk-data/:projectId/history returns history list", async () => {
    const history = [
      { _id: new mongoose.Types.ObjectId(), projectId: project._id, temperature: 27, fetchedAt: new Date() },
      { _id: new mongoose.Types.ObjectId(), projectId: project._id, temperature: 29, fetchedAt: new Date() },
    ];

    riskDataService.getSnapshotHistory.mockResolvedValue(history);

    const res = await request(app)
      .get(`/api/risk-data/${project._id}/history`)
      .set("Authorization", `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(2);
    expect(Array.isArray(res.body.history)).toBe(true);
  });

  test("DELETE /api/risk-data/:snapshotId blocks contractor with 403", async () => {
    const res = await request(app)
      .delete(`/api/risk-data/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${contractorToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/access denied/i);
  });

  test("DELETE /api/risk-data/:snapshotId allows admin and returns success", async () => {
    const snapshotId = new mongoose.Types.ObjectId();
    riskDataService.deleteSnapshot.mockResolvedValue({ _id: snapshotId });

    const res = await request(app)
      .delete(`/api/risk-data/${snapshotId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    expect(riskDataService.deleteSnapshot).toHaveBeenCalledWith(String(snapshotId));
  });
});
