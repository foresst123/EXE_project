import express from "express";
import { body } from "express-validator";
import {
  createProductHandler,
  deleteProductHandler,
  getProduct,
  listProducts,
  updateProductHandler,
} from "../controllers/productController.js";
import {
  createCommentHandler,
  getCommentPermissionHandler,
  listCommentsHandler,
} from "../controllers/commentController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(listProducts));
router.get("/:id", asyncHandler(getProduct));
router.get("/:id/comments", asyncHandler(listCommentsHandler));
router.get("/:id/comments/permission", protect, asyncHandler(getCommentPermissionHandler));
router.post(
  "/:id/comments",
  protect,
  [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Nội dung đánh giá là bắt buộc")
      .isLength({ max: 500 })
      .withMessage("Đánh giá không được vượt quá 500 ký tự"),
    body("media_type")
      .optional({ values: "falsy" })
      .isIn(["image", "video"])
      .withMessage("Loại tệp phải là ảnh hoặc video"),
    validate,
  ],
  asyncHandler(createCommentHandler),
);

router.post(
  "/",
  protect,
  requireAdmin,
  [
    body("name").trim().notEmpty().withMessage("Tên sản phẩm là bắt buộc"),
    body("price").isFloat({ gt: 0 }).withMessage("Giá bán phải lớn hơn 0"),
    body("stock").isInt({ min: 0 }).withMessage("Tồn kho phải lớn hơn hoặc bằng 0"),
    body("category_id").isInt({ min: 1 }).withMessage("Danh mục là bắt buộc"),
    body("author_id").isInt({ min: 1 }).withMessage("Nhà thiết kế là bắt buộc"),
    validate,
  ],
  asyncHandler(createProductHandler),
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  [
    body("price").optional().isFloat({ gt: 0 }).withMessage("Giá bán phải lớn hơn 0"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Tồn kho phải lớn hơn hoặc bằng 0"),
    body("author_id").optional().isInt({ min: 1 }).withMessage("Nhà thiết kế không hợp lệ"),
    validate,
  ],
  asyncHandler(updateProductHandler),
);

router.delete("/:id", protect, requireAdmin, asyncHandler(deleteProductHandler));

export default router;
