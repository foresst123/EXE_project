import {
  getUserByIdForAdmin,
  getCurrentUser,
  getUsers,
  sendVerificationEmail,
  updateCurrentUserEmail,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
  updateCurrentUserSecurity,
  updateUserPasswordAsAdmin,
  updateUserRole,
} from "../services/userService.js";

export const getCurrentUserHandler = async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  res.json(user);
};

export const updateCurrentUserProfileHandler = async (req, res) => {
  const user = await updateCurrentUserProfile(req.user.id, req.body);
  res.json(user);
};

export const updateCurrentUserEmailHandler = async (req, res) => {
  const user = await updateCurrentUserEmail(req.user.id, req.body.email, req.body.current_password);
  res.json(user);
};

export const updateCurrentUserPasswordHandler = async (req, res) => {
  const user = await updateCurrentUserPassword(
    req.user.id,
    req.body.current_password,
    req.body.new_password,
  );
  res.json(user);
};

export const updateCurrentUserSecurityHandler = async (req, res) => {
  const user = await updateCurrentUserSecurity(req.user.id, req.body.preferred_auth_method);
  res.json(user);
};

export const sendVerificationEmailHandler = async (req, res) => {
  const result = await sendVerificationEmail(req.user.id);
  res.json(result);
};

export const getUsersHandler = async (_req, res) => {
  const users = await getUsers();
  res.json(users);
};

export const getUserByIdHandler = async (req, res) => {
  const user = await getUserByIdForAdmin(req.params.id);
  res.json(user);
};

export const updateUserRoleHandler = async (req, res) => {
  const user = await updateUserRole(req.params.id, req.body.role);
  res.json(user);
};

export const updateUserPasswordAsAdminHandler = async (req, res) => {
  const user = await updateUserPasswordAsAdmin(req.params.id, req.body.password);
  res.json(user);
};
