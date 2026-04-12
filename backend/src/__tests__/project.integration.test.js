const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../models/User');
const Project = require('../models/Project');

jest.mock('../services/geocode.service', () => ({
  getCoordinates: jest.fn().mockResolvedValue({ lat: 6.9271, lng: 79.8612 }),
}));

const geocodeService = require('../services/geocode.service');

describe('Component 1 Integration Tests - Project API', () => {
  let adminUser;
  let ownerUser;
  let otherUser;
  let adminToken;
  let ownerToken;
  let otherToken;

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
    ]);

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin.project@test.com',
      password: 'secret123',
      role: 'ADMIN',
      isVerified: true,
    });

    ownerUser = await User.create({
      name: 'Owner User',
      email: 'owner.project@test.com',
      password: 'secret123',
      role: 'CONTRACTOR',
      isVerified: true,
    });

    otherUser = await User.create({
      name: 'Other Contractor',
      email: 'other.project@test.com',
      password: 'secret123',
      role: 'CONTRACTOR',
      isVerified: true,
    });

    adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);
    ownerToken = jwt.sign({ userId: ownerUser._id }, process.env.JWT_SECRET);
    otherToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET);

    geocodeService.getCoordinates.mockResolvedValue({ lat: 6.9271, lng: 79.8612 });
  });

  test('POST /api/projects creates project with valid token', async () => {
    const payload = {
      title: 'Kelani Bridge',
      description: 'Integration create test',
      projectType: 'bridge',
      location: { address: 'Colombo, Sri Lanka' },
      budget: 1500000,
      startDate: '2099-01-10',
      endDate: '2099-02-10',
    };

    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(payload.title);
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.createdBy).toBe(String(ownerUser._id));
  });

  test('GET /api/projects lists only authenticated contractor projects', async () => {
    await Project.create([
      {
        title: 'Owner Project',
        projectType: 'road',
        location: { address: 'Galle, Sri Lanka', lat: 6.0329, lng: 80.2168 },
        createdBy: ownerUser._id,
      },
      {
        title: 'Other Project',
        projectType: 'building',
        location: { address: 'Jaffna, Sri Lanka', lat: 9.6615, lng: 80.0255 },
        createdBy: otherUser._id,
      },
    ]);

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.projects).toHaveLength(1);
    expect(res.body.projects[0].title).toBe('Owner Project');
  });

  test('PUT /api/projects/:id allows only owner to edit', async () => {
    const project = await Project.create({
      title: 'Editable Project',
      projectType: 'bridge',
      location: { address: 'Kandy, Sri Lanka', lat: 7.2906, lng: 80.6337 },
      createdBy: ownerUser._id,
    });

    const successRes = await request(app)
      .put(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Updated by Owner' });

    expect(successRes.statusCode).toBe(200);
    expect(successRes.body.title).toBe('Updated by Owner');

    const forbiddenRes = await request(app)
      .put(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Attempted by Other User' });

    expect(forbiddenRes.statusCode).toBe(403);
  });

  test('PATCH /api/projects/:id/status allows only ADMIN to set APPROVED', async () => {
    const project = await Project.create({
      title: 'Status Project',
      projectType: 'road',
      status: 'ANALYZING',
      location: { address: 'Matara, Sri Lanka', lat: 5.9549, lng: 80.555 },
      createdBy: ownerUser._id,
    });

    const forbiddenRes = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'APPROVED' });

    expect(forbiddenRes.statusCode).toBe(403);

    const successRes = await request(app)
      .patch(`/api/projects/${project._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    expect(successRes.statusCode).toBe(200);
    expect(successRes.body.status).toBe('APPROVED');
  });

  test('DELETE /api/projects/:id removes project and returns success', async () => {
    const project = await Project.create({
      title: 'Delete Project',
      projectType: 'building',
      location: { address: 'Negombo, Sri Lanka', lat: 7.2083, lng: 79.8358 },
      createdBy: ownerUser._id,
    });

    const res = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);

    const deleted = await Project.findById(project._id);
    expect(deleted).toBeNull();
  });

  test('Auth/RBAC returns 401 for no token and 403 for forbidden actions', async () => {
    const project = await Project.create({
      title: 'Protected Project',
      projectType: 'bridge',
      location: { address: 'Kurunegala, Sri Lanka', lat: 7.4863, lng: 80.3647 },
      createdBy: ownerUser._id,
    });

    const unauthorized = await request(app)
      .get('/api/projects');

    expect(unauthorized.statusCode).toBe(401);

    const forbidden = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(forbidden.statusCode).toBe(403);
  });
});
