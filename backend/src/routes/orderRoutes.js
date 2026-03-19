import express from "express";
import { body } from "express-validator";
import {
  confirmOrderPaymentHandler,
  createCheckoutSessionHandler,
  getOrderHandler,
  getOrdersHandler,
  updateOrderStatusHandler,
} from "../controllers/orderController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(protect);

router.post("/checkout-session", asyncHandler(createCheckoutSessionHandler));
router.post("/:id/confirm-payment", asyncHandler(confirmOrderPaymentHandler));
router.get("/", asyncHandler(getOrdersHandler));
router.get("/:id", asyncHandler(getOrderHandler));
router.patch(
  "/:id/status",
  requireAdmin,
  [
    body("status")
      .isIn([
        "awaiting_payment",
        "payment_failed",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ])
      .withMessage("Trạng thái đơn hàng không hợp lệ"),
    validate,
  ],
  asyncHandler(updateOrderStatusHandler),
);

export default router;
