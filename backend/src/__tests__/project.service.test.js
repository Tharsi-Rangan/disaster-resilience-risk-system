const projectController = require('../controllers/project.controller');

jest.mock('../services/geocode.service', () => ({
  getCoordinates: jest.fn(),
}));

jest.mock('../models/Project', () => {
  const ProjectMock = jest.fn().mockImplementation((data) => ({
    ...data,
    status: data.status || 'DRAFT',
    save: jest.fn().mockResolvedValue(undefined),
  }));

  ProjectMock.findById = jest.fn();

  return ProjectMock;
});

const Project = require('../models/Project');
const geocodeService = require('../services/geocode.service');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Component 1 Unit Tests - project controller logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createProject rejects startDate in the past', async () => {
    const req = {
      user: { _id: 'user-1' },
      body: {
        title: 'Past Start Project',
        projectType: 'bridge',
        location: { address: 'Colombo, Sri Lanka' },
        startDate: '2020-01-01',
      },
    };
    const res = mockRes();

    await projectController.createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'startDate cannot be in the past' });
    expect(geocodeService.getCoordinates).not.toHaveBeenCalled();
    expect(Project).not.toHaveBeenCalled();
  });

  test('createProject rejects out-of-range geocoded coordinates', async () => {
    geocodeService.getCoordinates.mockResolvedValue({ lat: 123.45, lng: 200.12 });

    const req = {
      user: { _id: 'user-1' },
      body: {
        title: 'Invalid Coordinates Project',
        projectType: 'road',
        location: { address: 'Kandy, Sri Lanka' },
        startDate: '2099-01-01',
      },
    };
    const res = mockRes();

    await projectController.createProject(req, res);

    expect(geocodeService.getCoordinates).toHaveBeenCalledWith('Kandy, Sri Lanka');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid geocoded coordinates' });
    expect(Project).not.toHaveBeenCalled();
  });

  test('createProject creates project with DRAFT status and geocoded coordinates', async () => {
    geocodeService.getCoordinates.mockResolvedValue({ lat: 6.9271, lng: 79.8612 });

    const req = {
      user: { _id: 'user-1' },
      body: {
        title: 'Kelani Bridge',
        description: 'Bridge resilience project',
        projectType: 'bridge',
        location: { address: 'Colombo, Sri Lanka' },
        budget: 1000000,
        startDate: '2099-03-10',
        endDate: '2099-04-10',
      },
    };
    const res = mockRes();

    await projectController.createProject(req, res);

    expect(Project).toHaveBeenCalledTimes(1);
    const createdProject = Project.mock.results[0].value;
    expect(createdProject.location).toEqual({
      address: 'Colombo, Sri Lanka',
      lat: 6.9271,
      lng: 79.8612,
    });
    expect(createdProject.status).toBe('DRAFT');
    expect(createdProject.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('updateProjectStatus supports DRAFT -> ANALYZING transition', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const projectDoc = {
      _id: 'project-1',
      status: 'DRAFT',
      save,
    };

    Project.findById.mockResolvedValue(projectDoc);

    const req = {
      params: { id: 'project-1' },
      body: { status: 'ANALYZING' },
    };
    const res = mockRes();

    await projectController.updateProjectStatus(req, res);

    expect(Project.findById).toHaveBeenCalledWith('project-1');
    expect(projectDoc.status).toBe('ANALYZING');
    expect(save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalled();
  });
});
