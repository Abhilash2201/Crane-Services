const { verifyToken } = require("../utils/jwt");
const { HttpError } = require("../utils/httpError");

function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Unauthorized"));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.user = verifyToken(token);
    return next();
  } catch (_error) {
    return next(new HttpError(401, "Invalid or expired token"));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, "Unauthorized"));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, "Forbidden"));
    return next();
  };
}

module.exports = { requireAuth, authorize };
