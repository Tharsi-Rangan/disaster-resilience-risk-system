const Project = require("../models/Project");
const geocodeService = require("../services/geocode.service");

// Create Project
exports.createProject = async (req, res) => {
  try {
    const { title, description, projectType, location, budget, startDate, endDate } = req.body;
    const coordinates = await geocodeService.getCoordinates(location.address);

    const project = new Project({
      title,
      description,
      projectType,
      location: {
        address: location.address,
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
      budget,
      startDate,
      endDate,
      createdBy: req.user._id
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Projects with pagination & search
exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;

    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (type) query.projectType = type;
    if (status) query.status = status;

    const projects = await Project.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({ total, page, projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { title, description, projectType, location, budget, startDate, endDate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (req.user.role !== "admin" && !project.createdBy.equals(req.user._id))
      return res.status(403).json({ message: "Not authorized" });

    if (title) project.title = title;
    if (description) project.description = description;
    if (projectType) project.projectType = projectType;
    if (location?.address) {
      const coords = await geocodeService.getCoordinates(location.address);
      project.location = { address: location.address, lat: coords.lat, lng: coords.lng };
    }
    if (budget) project.budget = budget;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (req.user.role !== "admin" && !project.createdBy.equals(req.user._id))
      return res.status(403).json({ message: "Not authorized" });

    await project.remove();
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Patch status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.status = status;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};