import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const productSelect = `SELECT p.*, c.name AS category_name,
       a.name AS author_name, a.slug AS author_slug, a.bio AS author_bio, a.avatar_url AS author_avatar_url,
       COALESCE(sales.sold_count, 0) AS sold_count,
       COALESCE(comment_stats.comment_count, 0) AS comment_count
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN authors a ON a.id = p.author_id
     LEFT JOIN (
       SELECT oi.product_id, SUM(oi.quantity)::int AS sold_count
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.payment_status = 'paid'
       GROUP BY oi.product_id
     ) sales ON sales.product_id = p.id
     LEFT JOIN (
       SELECT product_id, COUNT(*)::int AS comment_count
       FROM comments
       GROUP BY product_id
     ) comment_stats ON comment_stats.product_id = p.id`;

export const getProducts = async ({
  page = 1,
  limit = 8,
  search = "",
  category = [],
  author = [],
}) => {
  const offset = (page - 1) * limit;
  const filters = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    filters.push(
      `(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR a.name ILIKE $${params.length})`,
    );
  }

  if (category.length) {
    params.push(category);
    filters.push(`c.name = ANY($${params.length})`);
  }

  if (author.length) {
    params.push(author);
    filters.push(`a.slug = ANY($${params.length})`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const countResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN authors a ON a.id = p.author_id
     ${whereClause}`,
    params,
  );

  params.push(limit, offset);

  const result = await query(
    `${productSelect}
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const categoryResult = await query("SELECT id, name FROM categories ORDER BY name ASC");
  const authorResult = await query(
    "SELECT id, name, slug, bio, avatar_url FROM authors ORDER BY name ASC",
  );

  return {
    items: result.rows,
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total,
      totalPages: Math.max(1, Math.ceil(countResult.rows[0].total / limit)),
    },
    categories: categoryResult.rows,
    authors: authorResult.rows,
  };
};

export const getProductById = async (id) => {
  const result = await query(
    `${productSelect}
     WHERE p.id = $1`,
    [id],
  );

  if (!result.rows[0]) {
    throw new AppError("Product not found", 404);
  }

  return result.rows[0];
};

export const createProduct = async ({
  name,
  description,
  price,
  stock,
  category_id,
  author_id,
  image_url,
}) => {
  const result = await query(
    `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, description, price, stock, category_id, author_id, image_url],
  );

  return result.rows[0];
};

export const updateProduct = async (id, payload) => {
  const current = await getProductById(id);
  const nextValue = {
    name: payload.name ?? current.name,
    description: payload.description ?? current.description,
    price: payload.price ?? current.price,
    stock: payload.stock ?? current.stock,
    category_id: payload.category_id ?? current.category_id,
    author_id: payload.author_id ?? current.author_id,
    image_url: payload.image_url ?? current.image_url,
  };

  const result = await query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, author_id = $6, image_url = $7
     WHERE id = $8
     RETURNING *`,
    [
      nextValue.name,
      nextValue.description,
      nextValue.price,
      nextValue.stock,
      nextValue.category_id,
      nextValue.author_id,
      nextValue.image_url,
      id,
    ],
  );

  return result.rows[0];
};

export const deleteProduct = async (id) => {
  const result = await query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);

  if (!result.rows[0]) {
    throw new AppError("Product not found", 404);
  }

  return { success: true };
};
