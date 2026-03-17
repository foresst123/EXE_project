import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export const getCommentsByProductId = async (productId) => {
  const result = await query(
    `SELECT c.id, c.content, c.media_url, c.media_type, c.created_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.product_id = $1
     ORDER BY c.created_at DESC`,
    [productId],
  );

  return {
    items: result.rows,
    total: result.rows.length,
  };
};

export const getCommentPermission = async (productId, userId) => {
  const productResult = await query("SELECT id FROM products WHERE id = $1", [productId]);

  if (!productResult.rows[0]) {
    throw new AppError("Product not found", 404);
  }

  const [purchaseResult, commentResult] = await Promise.all([
    query(
      `SELECT 1
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
         AND oi.product_id = $2
         AND o.payment_status = 'paid'
       LIMIT 1`,
      [userId, productId],
    ),
    query("SELECT 1 FROM comments WHERE product_id = $1 AND user_id = $2 LIMIT 1", [productId, userId]),
  ]);

  const hasPurchased = Boolean(purchaseResult.rows[0]);
  const hasCommented = Boolean(commentResult.rows[0]);

  return {
    hasPurchased,
    hasCommented,
    canComment: hasPurchased && !hasCommented,
  };
};

export const createComment = async (productId, user, payload) => {
  const content = payload.content.trim();
  const mediaUrl = payload.media_url?.trim() || null;
  const mediaType = mediaUrl ? payload.media_type : null;

  if (!content) {
    throw new AppError("Comment content is required", 422);
  }

  if (content.length > 500) {
    throw new AppError("Comment must be 500 characters or fewer", 422);
  }

  if (mediaUrl && !mediaType) {
    throw new AppError("Please choose whether the media is an image or video", 422);
  }

  const productResult = await query("SELECT id FROM products WHERE id = $1", [productId]);

  if (!productResult.rows[0]) {
    throw new AppError("Product not found", 404);
  }

  const permission = await getCommentPermission(productId, user.id);

  if (!permission.hasPurchased) {
    throw new AppError("Only customers who purchased this product can leave a review", 403);
  }

  if (permission.hasCommented) {
    throw new AppError("You have already commented on this product", 409);
  }

  try {
    const result = await query(
      `INSERT INTO comments (product_id, user_id, content, media_url, media_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [productId, user.id, content, mediaUrl, mediaType],
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError("You have already commented on this product", 409);
    }

    throw error;
  }
};
