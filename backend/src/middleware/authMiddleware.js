import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const result = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.userId],
    );

    if (!result.rows[0]) {
      return next(new AppError("User not found", 401));
    }

    req.user = result.rows[0];
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError("Admin access required", 403));
  }

  return next();
};
