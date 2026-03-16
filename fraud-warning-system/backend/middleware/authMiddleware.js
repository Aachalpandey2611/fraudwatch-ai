const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return res.status(401).json({ success: false, message: "Not authorized" });

  try {
    const secret = process.env.JWT_SECRET || "dev-secret-change-in-production";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token invalid" });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};

const authorizePrincipalType = (...types) => {
  return (req, res, next) => {
    if (!req.user?.principalType) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (!types.includes(req.user.principalType)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};

module.exports = { protect, authorizeRole, authorizePrincipalType };
