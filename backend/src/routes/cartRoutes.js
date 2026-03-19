import express from "express";
import { body } from "express-validator";
import {
  addToCartHandler,
  getCartHandler,
  removeFromCartHandler,
  updateCartQuantityHandler,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(protect);

router.get("/", asyncHandler(getCartHandler));
router.post(
  "/add",
  [
    body("product_id").isInt({ min: 1 }).withMessage("Sản phẩm là bắt buộc"),
    body("quantity").isInt({ min: 1 }).withMessage("Số lượng phải lớn hơn hoặc bằng 1"),
    validate,
  ],
  asyncHandler(addToCartHandler),
);
router.delete(
  "/remove",
  [body("product_id").isInt({ min: 1 }).withMessage("Sản phẩm là bắt buộc"), validate],
  asyncHandler(removeFromCartHandler),
);
router.patch(
  "/quantity",
  [
    body("product_id").isInt({ min: 1 }).withMessage("Sản phẩm là bắt buộc"),
    body("quantity").isInt({ min: 1 }).withMessage("Số lượng phải lớn hơn hoặc bằng 1"),
    validate,
  ],
  asyncHandler(updateCartQuantityHandler),
);

export default router;
