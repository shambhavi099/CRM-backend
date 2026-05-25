const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {

    console.log("USER ROLE:", req.user.role);
    console.log("ALLOWED ROLES:", allowedRoles);

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;