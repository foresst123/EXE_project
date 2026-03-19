import express from "express";
import { body } from "express-validator";
import {
  getCurrentUserHandler,
  getUserByIdHandler,
  getUsersHandler,
  sendVerificationEmailHandler,
  updateCurrentUserEmailHandler,
  updateCurrentUserPasswordHandler,
  updateCurrentUserProfileHandler,
  updateCurrentUserSecurityHandler,
  updateUserPasswordAsAdminHandler,
  updateUserRoleHandler,
} from "../controllers/userController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(protect);

router.get("/me", asyncHandler(getCurrentUserHandler));
router.patch(
  "/me/profile",
  [
    body("name").trim().notEmpty().withMessage("Tên là bắt buộc"),
    body("phone").optional({ values: "falsy" }).trim().isLength({ max: 40 }).withMessage("Số điện thoại quá dài"),
    body("location").optional({ values: "falsy" }).trim().isLength({ max: 120 }).withMessage("Địa điểm quá dài"),
    body("bio").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Phần giới thiệu quá dài"),
    body("avatar_url").optional({ values: "falsy" }).isURL().withMessage("Liên kết ảnh đại diện không hợp lệ"),
    validate,
  ],
  asyncHandler(updateCurrentUserProfileHandler),
);
router.patch(
  "/me/email",
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("current_password").notEmpty().withMessage("Mật khẩu hiện tại là bắt buộc"),
    validate,
  ],
  asyncHandler(updateCurrentUserEmailHandler),
);
router.patch(
  "/me/password",
  [
    body("current_password").notEmpty().withMessage("Mật khẩu hiện tại là bắt buộc"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu mới phải có ít nhất 6 ký tự"),
    validate,
  ],
  asyncHandler(updateCurrentUserPasswordHandler),
);
router.patch(
  "/me/security",
  [
    body("preferred_auth_method")
      .isIn(["email", "authenticator", "backup_codes"])
      .withMessage("Phương thức xác minh không hợp lệ"),
    validate,
  ],
  asyncHandler(updateCurrentUserSecurityHandler),
);
router.post("/me/email-verification", asyncHandler(sendVerificationEmailHandler));

router.use(requireAdmin);

router.get("/", asyncHandler(getUsersHandler));
router.get("/:id", asyncHandler(getUserByIdHandler));
router.patch(
  "/:id/role",
  [body("role").isIn(["admin", "customer"]).withMessage("Vai trò không hợp lệ"), validate],
  asyncHandler(updateUserRoleHandler),
);
router.patch(
  "/:id/password",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
    validate,
  ],
  asyncHandler(updateUserPasswordAsAdminHandler),
);

export default router;
