import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  location: user.location,
  bio: user.bio,
  avatar_url: user.avatar_url,
  email_verified: user.email_verified,
  email_verified_at: user.email_verified_at,
  verification_email_sent_at: user.verification_email_sent_at,
  preferred_auth_method: user.preferred_auth_method,
  password_changed_at: user.password_changed_at,
  updated_at: user.updated_at,
  created_at: user.created_at,
});

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);

  if (existingUser.rows[0]) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role, preferred_auth_method)
     VALUES ($1, LOWER($2), $3, 'customer', 'email')
     RETURNING id, name, email, role, phone, location, bio, avatar_url, email_verified,
       email_verified_at, verification_email_sent_at, preferred_auth_method, password_changed_at,
       updated_at, created_at`,
    [name, email, passwordHash],
  );

  const user = result.rows[0];
  const token = signToken({ userId: user.id, role: user.role });

  return { user: sanitizeUser(user), token };
};

export const loginUser = async ({ email, password }) => {
  const result = await query("SELECT * FROM users WHERE email = LOWER($1)", [email]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id, role: user.role });

  return { user: sanitizeUser(user), token };
};
