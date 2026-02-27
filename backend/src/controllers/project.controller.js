const Project = require("../models/Project");
const geocodeService = require("../services/geocode.service");

const VALID_STATUSES = ["DRAFT", "ANALYZING", "APPROVED", "HIGH_RISK"];

// ─── Create Project ───────────────────────────────────────────────────────────
exports.createProject = async (req, res) => {
  try {
    const { title, description, projectType, location, budget, startDate, endDate } = req.body;

    // Validate location exists
    if (!location?.address) {
      return res.status(400).json({ message: "Location address is required" });
    }

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

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
      createdBy: req.user._id,
    });

    await project.save();
    return res.status(201).json(project);
  } catch (err) {
    console.error("createProject error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─── Get All Projects (pagination + search + filter) ─────────────────────────
exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // cap at 100

    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (type) query.projectType = type;
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      query.status = status;
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate("createdBy", "name email") // show creator info
        .sort({ createdAt: -1 })             // newest first
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Project.countDocuments(query),
    ]);

    return res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      projects,
    });
  } catch (err) {
    console.error("getProjects error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─── Get Single Project ───────────────────────────────────────────────────────
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("createdBy", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (err) {
    console.error("getProjectById error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─── Update Project ───────────────────────────────────────────────────────────
exports.updateProject = async (req, res) => {
  try {
    const { title, description, projectType, location, budget, startDate, endDate, status } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Authorization check
    if (req.user.role !== "admin" && !project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Validate date range if both provided
    const newStart = startDate || project.startDate;
    const newEnd = endDate || project.endDate;
    if (newStart && newEnd && new Date(newStart) > new Date(newEnd)) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

    // Apply updates
    if (title) project.title = title;
    if (description !== undefined) project.description = description; // allow clearing
    if (projectType) project.projectType = projectType;
    if (budget !== undefined) project.budget = budget;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;

    // Geocode only if address actually changed
    if (location?.address && location.address !== project.location.address) {
      const coords = await geocodeService.getCoordinates(location.address);
      project.location = { address: location.address, lat: coords.lat, lng: coords.lng };
    }

    // Only admins can change status via PUT
    if (status !== undefined) {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update project status" });
      }
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      project.status = status;
    }

    await project.save();
    return res.json(project);
  } catch (err) {
    console.error("updateProject error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─── Delete Project ───────────────────────────────────────────────────────────
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Authorization check
    if (req.user.role !== "admin" && !project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Project.findByIdAndDelete(req.params.id);
    return res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("deleteProject error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ─── Patch Project Status (admin only) ───────────────────────────────────────
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status value
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.status = status;
    await project.save();
    return res.json(project);
  } catch (err) {
    console.error("updateProjectStatus error:", err);
    return res.status(500).json({ message: err.message });
  }
};