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
    body("title").trim().notEmpty().withMessage("Tiêu đề sự kiện là bắt buộc"),
    body("banner_image_url").isURL().withMessage("Liên kết ảnh banner không hợp lệ"),
    body("slot").isIn(["hero", "side"]).withMessage("Vị trí hiển thị sự kiện không hợp lệ"),
    validate,
  ],
  asyncHandler(createEventHandler),
);
router.put(
  "/:id",
  protect,
  requireAdmin,
  [
    body("title").optional().trim().notEmpty().withMessage("Tiêu đề sự kiện là bắt buộc"),
    body("banner_image_url").optional().isURL().withMessage("Liên kết ảnh banner không hợp lệ"),
    body("slot").optional().isIn(["hero", "side"]).withMessage("Vị trí hiển thị sự kiện không hợp lệ"),
    validate,
  ],
  asyncHandler(updateEventHandler),
);
router.delete("/:id", protect, requireAdmin, asyncHandler(deleteEventHandler));
router.get("/:slug", asyncHandler(getEventHandler));

export default router;
