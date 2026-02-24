exports.ownerOrAdmin = (model) => async (req, res, next) => {
  try {
    const doc = await model.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "admin" && !doc.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};