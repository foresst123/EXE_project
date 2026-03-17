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
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone").optional({ values: "falsy" }).trim().isLength({ max: 40 }).withMessage("Phone is too long"),
    body("location").optional({ values: "falsy" }).trim().isLength({ max: 120 }).withMessage("Location is too long"),
    body("bio").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Bio is too long"),
    body("avatar_url").optional({ values: "falsy" }).isURL().withMessage("Avatar URL must be valid"),
    validate,
  ],
  asyncHandler(updateCurrentUserProfileHandler),
);
router.patch(
  "/me/email",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("current_password").notEmpty().withMessage("Current password is required"),
    validate,
  ],
  asyncHandler(updateCurrentUserEmailHandler),
);
router.patch(
  "/me/password",
  [
    body("current_password").notEmpty().withMessage("Current password is required"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    validate,
  ],
  asyncHandler(updateCurrentUserPasswordHandler),
);
router.patch(
  "/me/security",
  [
    body("preferred_auth_method")
      .isIn(["email", "authenticator", "backup_codes"])
      .withMessage("Invalid verification method"),
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
  [body("role").isIn(["admin", "customer"]).withMessage("Invalid role"), validate],
  asyncHandler(updateUserRoleHandler),
);
router.patch(
  "/:id/password",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    validate,
  ],
  asyncHandler(updateUserPasswordAsAdminHandler),
);

export default router;
