// middleware/roleMiddleware.js
const role = (allowedRoles = []) => {
  if (typeof allowedRoles === "string") {
    allowedRoles = [allowedRoles]; // allow single role
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient rights" });
    }

    next();
  };
};

module.exports = role;
