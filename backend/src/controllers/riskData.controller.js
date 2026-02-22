const mongoose = require("mongoose");
const RiskSnapshot = require("../models/RiskSnapshot");

// IMPORTANT: Component 2 should NOT implement Project CRUD.
// We only read project location. For now:
// - Either you call Project model if it exists later
// - Or accept lat/lng from request body as fallback.
//
// Best approach now: try to load Project model if present, else fallback.
let Project = null;
try {
  Project = require("../models/Project"); // will exist when Component 1 merges
} catch (e) {
  Project = null;
}

const {
  getWeatherData,
  getEarthquakeCount,
  calculateFloodRiskIndex,
} = require("../services/riskData.service");

const fetchRiskDataForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    // prevent spam fetch
    const minIntervalMin = Number(process.env.RISKDATA_MIN_FETCH_INTERVAL_MIN || 10);
    const latest = await RiskSnapshot.findOne({ projectId }).sort({ fetchedAt: -1 });

    if (latest) {
      const diffMs = Date.now() - new Date(latest.fetchedAt).getTime();
      const diffMin = diffMs / (60 * 1000);
      if (diffMin < minIntervalMin) {
        return res.status(429).json({
          message: `Please wait. Last snapshot was ${diffMin.toFixed(
            1
          )} min ago (min interval ${minIntervalMin} min).`,
        });
      }
    }

    let lat = null;
    let lng = null;

    // Option A: If Component 1's Project model exists, use it
    if (Project) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });

      lat = project?.location?.lat;
      lng = project?.location?.lng;
    }

    // Option B fallback: allow passing lat/lng in body if Project not available yet
    if ((!lat || !lng) && req.body?.lat && req.body?.lng) {
      lat = Number(req.body.lat);
      lng = Number(req.body.lng);
    }

    if (!lat || !lng) {
      return res.status(400).json({
        message:
          "Project location not available. (If Project not merged yet, send lat/lng in request body.)",
      });
    }

    // 3rd party API calls
    const weather = await getWeatherData({ lat, lng });

    // optional: USGS
    let earthquakeCount = 0;
    let usedUsgs = false;
    try {
      earthquakeCount = await getEarthquakeCount({ lat, lng, days: 7, radiusKm: 100 });
      usedUsgs = true;
    } catch (e) {
      // do not fail whole request if USGS fails
      earthquakeCount = 0;
      usedUsgs = false;
    }

    const floodRiskIndex = calculateFloodRiskIndex({
      rainfall: weather.rainfall,
      windSpeed: weather.windSpeed,
    });

    const snapshot = await RiskSnapshot.create({
      projectId,
      rainfall: weather.rainfall,
      windSpeed: weather.windSpeed,
      temperature: weather.temperature,
      earthquakeCount,
      floodRiskIndex,
      fetchedAt: new Date(),
      source: { openWeather: true, usgs: usedUsgs },
      meta: { lat, lng },
    });

    return res.status(201).json({
      message: "Risk data fetched & stored ✅",
      snapshot,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getLatestRiskData = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const snapshot = await RiskSnapshot.findOne({ projectId }).sort({ fetchedAt: -1 });

    if (!snapshot) {
      return res.status(404).json({ message: "No snapshots found for this project" });
    }

    res.json({ snapshot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRiskHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      RiskSnapshot.find({ projectId }).sort({ fetchedAt: -1 }).skip(skip).limit(limit),
      RiskSnapshot.countDocuments({ projectId }),
    ]);

    res.json({
      page,
      limit,
      total,
      items,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSnapshot = async (req, res) => {
  try {
    const { snapshotId } = req.params;

    if (!mongoose.isValidObjectId(snapshotId)) {
      return res.status(400).json({ message: "Invalid snapshotId" });
    }

    const deleted = await RiskSnapshot.findByIdAndDelete(snapshotId);
    if (!deleted) return res.status(404).json({ message: "Snapshot not found" });

    res.json({ message: "Snapshot deleted ✅", deletedId: deleted._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  fetchRiskDataForProject,
  getLatestRiskData,
  getRiskHistory,
  deleteSnapshot,
};