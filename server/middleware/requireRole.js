const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
  next();
};

export default requireRole;