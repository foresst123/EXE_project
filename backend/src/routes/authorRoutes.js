import express from "express";
import { body } from "express-validator";
import {
  createAuthorHandler,
  deleteAuthorHandler,
  getAuthorHandler,
  listAuthors,
  updateAuthorHandler,
} from "../controllers/authorController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(listAuthors));
router.get("/:slug", asyncHandler(getAuthorHandler));
router.post(
  "/",
  protect,
  requireAdmin,
  [
    body("name").trim().notEmpty().withMessage("Artist name is required"),
    body("avatar_url").optional({ values: "falsy" }).isURL().withMessage("Avatar URL must be valid"),
    validate,
  ],
  asyncHandler(createAuthorHandler),
);
router.put(
  "/:id",
  protect,
  requireAdmin,
  [
    body("name").optional().trim().notEmpty().withMessage("Artist name is required"),
    body("avatar_url").optional({ values: "falsy" }).isURL().withMessage("Avatar URL must be valid"),
    validate,
  ],
  asyncHandler(updateAuthorHandler),
);
router.delete("/:id", protect, requireAdmin, asyncHandler(deleteAuthorHandler));

export default router;
