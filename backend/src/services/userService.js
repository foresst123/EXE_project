import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const userSelect = `
  id,
  name,
  email,
  role,
  phone,
  location,
  bio,
  avatar_url,
  email_verified,
  email_verified_at,
  verification_email_sent_at,
  preferred_auth_method,
  password_changed_at,
  updated_at,
  created_at
`;

export const getUsers = async () => {
  const result = await query(
    `SELECT ${userSelect} FROM users ORDER BY created_at DESC`,
  );

  return result.rows;
};

export const getUserByIdForAdmin = async (id) => {
  const result = await query(
    `SELECT ${userSelect},
            COALESCE(order_stats.order_count, 0)::int AS order_count,
            COALESCE(order_stats.total_spent, 0)::numeric AS total_spent,
            order_stats.last_order_at
     FROM users u
     LEFT JOIN (
       SELECT user_id,
              COUNT(*)::int AS order_count,
              SUM(total_price)::numeric AS total_spent,
              MAX(created_at) AS last_order_at
       FROM orders
       GROUP BY user_id
     ) order_stats ON order_stats.user_id = u.id
     WHERE u.id = $1`,
    [id],
  );

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return result.rows[0];
};

export const updateUserRole = async (id, role) => {
  const result = await query(
    `UPDATE users
     SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING ${userSelect}`,
    [role, id],
  );

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return result.rows[0];
};

export const getCurrentUser = async (id) => {
  const result = await query(`SELECT ${userSelect} FROM users WHERE id = $1`, [id]);

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return result.rows[0];
};

export const updateCurrentUserProfile = async (id, payload) => {
  const { name, phone = "", location = "", bio = "", avatar_url = "" } = payload;
  const result = await query(
    `UPDATE users
     SET name = $1,
         phone = $2,
         location = $3,
         bio = $4,
         avatar_url = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING ${userSelect}`,
    [name, phone.trim(), location.trim(), bio.trim(), avatar_url.trim(), id],
  );

  return result.rows[0];
};

export const updateCurrentUserEmail = async (id, nextEmail, currentPassword) => {
  const existing = await query("SELECT * FROM users WHERE id = $1", [id]);
  const user = existing.rows[0];

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isValid) {
    throw new AppError("Mật khẩu hiện tại không đúng", 400);
  }

  const duplicate = await query("SELECT id FROM users WHERE email = LOWER($1) AND id <> $2", [nextEmail, id]);

  if (duplicate.rows[0]) {
    throw new AppError("Email này đã được đăng ký", 409);
  }

  const result = await query(
    `UPDATE users
     SET email = LOWER($1),
         email_verified = FALSE,
         email_verified_at = NULL,
         verification_email_sent_at = NOW(),
         preferred_auth_method = 'email',
         updated_at = NOW()
     WHERE id = $2
     RETURNING ${userSelect}`,
    [nextEmail, id],
  );

  return result.rows[0];
};

export const updateCurrentUserPassword = async (id, currentPassword, nextPassword) => {
  const existing = await query("SELECT * FROM users WHERE id = $1", [id]);
  const user = existing.rows[0];

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isValid) {
    throw new AppError("Mật khẩu hiện tại không đúng", 400);
  }

  const nextHash = await bcrypt.hash(nextPassword, 10);
  const result = await query(
    `UPDATE users
     SET password_hash = $1,
         password_changed_at = NOW(),
         updated_at = NOW()
     WHERE id = $2
     RETURNING ${userSelect}`,
    [nextHash, id],
  );

  return result.rows[0];
};

export const updateCurrentUserSecurity = async (id, preferredAuthMethod) => {
  const result = await query(
    `UPDATE users
     SET preferred_auth_method = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING ${userSelect}`,
    [preferredAuthMethod, id],
  );

  return result.rows[0];
};

export const sendVerificationEmail = async (id) => {
  const result = await query(
    `UPDATE users
     SET verification_email_sent_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING ${userSelect}`,
    [id],
  );

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return {
    message: "Đã gửi hướng dẫn xác minh tới email của bạn.",
    user: result.rows[0],
  };
};

export const updateUserPasswordAsAdmin = async (id, nextPassword) => {
  const nextHash = await bcrypt.hash(nextPassword, 10);
  const result = await query(
    `UPDATE users
     SET password_hash = $1,
         password_changed_at = NOW(),
         updated_at = NOW()
     WHERE id = $2
     RETURNING ${userSelect}`,
    [nextHash, id],
  );

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return result.rows[0];
};
