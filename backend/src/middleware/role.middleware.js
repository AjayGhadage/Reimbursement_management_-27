export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({ message: "Access forbidden: insufficient role permissions" });
    }
    next();
  };
};
