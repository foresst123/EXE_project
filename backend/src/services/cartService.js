import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const getCartItemsQuery = async (userId) =>
  query(
    `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image_url
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1
     ORDER BY ci.id DESC`,
    [userId],
  );

export const getCart = async (userId) => {
  const result = await getCartItemsQuery(userId);
  const items = result.rows;
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return { items, total };
};

export const addToCart = async (userId, productId, quantity) => {
  const productResult = await query("SELECT id, stock FROM products WHERE id = $1", [productId]);
  const product = productResult.rows[0];

  if (!product) {
    throw new AppError("Không tìm thấy sản phẩm", 404);
  }

  if (quantity > product.stock) {
    throw new AppError("Số lượng yêu cầu vượt quá tồn kho", 400);
  }

  const existing = await query(
    "SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2",
    [userId, productId],
  );

  if (existing.rows[0]) {
    const nextQuantity = existing.rows[0].quantity + quantity;

    if (nextQuantity > product.stock) {
      throw new AppError("Số lượng yêu cầu vượt quá tồn kho", 400);
    }

    await query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
      nextQuantity,
      existing.rows[0].id,
    ]);
  } else {
    await query(
      "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)",
      [userId, productId, quantity],
    );
  }

  return getCart(userId);
};

export const updateCartQuantity = async (userId, productId, quantity) => {
  const productResult = await query("SELECT id, stock FROM products WHERE id = $1", [productId]);
  const product = productResult.rows[0];

  if (!product) {
    throw new AppError("Không tìm thấy sản phẩm", 404);
  }

  if (quantity < 1) {
    throw new AppError("Số lượng phải lớn hơn hoặc bằng 1", 400);
  }

  if (quantity > product.stock) {
    throw new AppError("Số lượng yêu cầu vượt quá tồn kho", 400);
  }

  const existing = await query(
    "SELECT id FROM cart_items WHERE user_id = $1 AND product_id = $2",
    [userId, productId],
  );

  if (!existing.rows[0]) {
    throw new AppError("Không tìm thấy sản phẩm trong giỏ hàng", 404);
  }

  await query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
    quantity,
    existing.rows[0].id,
  ]);

  return getCart(userId);
};

export const removeFromCart = async (userId, productId) => {
  await query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2", [
    userId,
    productId,
  ]);

  return getCart(userId);
};

export const clearCart = async (userId) => {
  await query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
};
