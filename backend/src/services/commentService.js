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
    throw new AppError("Không tìm thấy sản phẩm", 404);
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
    throw new AppError("Nội dung đánh giá là bắt buộc", 422);
  }

  if (content.length > 500) {
    throw new AppError("Đánh giá không được vượt quá 500 ký tự", 422);
  }

  if (mediaUrl && !mediaType) {
    throw new AppError("Vui lòng chọn loại tệp là ảnh hoặc video", 422);
  }

  const productResult = await query("SELECT id FROM products WHERE id = $1", [productId]);

  if (!productResult.rows[0]) {
    throw new AppError("Không tìm thấy sản phẩm", 404);
  }

  const permission = await getCommentPermission(productId, user.id);

  if (!permission.hasPurchased) {
    throw new AppError("Chỉ khách đã mua sản phẩm mới có thể đánh giá", 403);
  }

  if (permission.hasCommented) {
    throw new AppError("Bạn đã đánh giá sản phẩm này rồi", 409);
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
      throw new AppError("Bạn đã đánh giá sản phẩm này rồi", 409);
    }

    throw error;
  }
};
