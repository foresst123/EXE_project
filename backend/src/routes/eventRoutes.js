import express from "express";
import { body } from "express-validator";
import {
  createEventHandler,
  deleteEventHandler,
  getEventHandler,
  listAdminEvents,
  listEvents,
  updateEventHandler,
} from "../controllers/eventController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(listEvents));
router.get("/admin/list", protect, requireAdmin, asyncHandler(listAdminEvents));
router.post(
  "/",
  protect,
  requireAdmin,
  [
    body("title").trim().notEmpty().withMessage("Event title is required"),
    body("banner_image_url").isURL().withMessage("Banner image URL must be valid"),
    body("slot").isIn(["hero", "side"]).withMessage("Event slot is invalid"),
    validate,
  ],
  asyncHandler(createEventHandler),
);
router.put(
  "/:id",
  protect,
  requireAdmin,
  [
    body("title").optional().trim().notEmpty().withMessage("Event title is required"),
    body("banner_image_url").optional().isURL().withMessage("Banner image URL must be valid"),
    body("slot").optional().isIn(["hero", "side"]).withMessage("Event slot is invalid"),
    validate,
  ],
  asyncHandler(updateEventHandler),
);
router.delete("/:id", protect, requireAdmin, asyncHandler(deleteEventHandler));
router.get("/:slug", asyncHandler(getEventHandler));

export default router;
