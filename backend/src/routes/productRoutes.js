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
      .withMessage("Comment content is required")
      .isLength({ max: 500 })
      .withMessage("Comment must be 500 characters or fewer"),
    body("media_type")
      .optional({ values: "falsy" })
      .isIn(["image", "video"])
      .withMessage("Media type must be image or video"),
    validate,
  ],
  asyncHandler(createCommentHandler),
);

router.post(
  "/",
  protect,
  requireAdmin,
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be zero or greater"),
    body("category_id").isInt({ min: 1 }).withMessage("Category is required"),
    body("author_id").isInt({ min: 1 }).withMessage("Author is required"),
    validate,
  ],
  asyncHandler(createProductHandler),
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  [
    body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be zero or greater"),
    body("author_id").optional().isInt({ min: 1 }).withMessage("Author is invalid"),
    validate,
  ],
  asyncHandler(updateProductHandler),
);

router.delete("/:id", protect, requireAdmin, asyncHandler(deleteProductHandler));

export default router;
