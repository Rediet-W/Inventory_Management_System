const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as a SuperAdmin");
  }
};

const primaryAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin" && req.user.isPrimaryAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as the primary admin");
  }
};

export { admin, superAdmin, primaryAdmin };
