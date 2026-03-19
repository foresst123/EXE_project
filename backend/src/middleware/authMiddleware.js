import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Vui lòng đăng nhập để tiếp tục", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const result = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.userId],
    );

    if (!result.rows[0]) {
      return next(new AppError("Không tìm thấy người dùng", 401));
    }

    req.user = result.rows[0];
    return next();
  } catch {
    return next(new AppError("Token không hợp lệ hoặc đã hết hạn", 401));
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError("Chỉ quản trị viên mới có quyền thực hiện thao tác này", 403));
  }

  return next();
};
