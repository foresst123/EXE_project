import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getAuthors = async () => {
  const result = await query(
    `SELECT a.*,
            COUNT(p.id)::int AS product_count
     FROM authors a
     LEFT JOIN products p ON p.author_id = a.id
     GROUP BY a.id
     ORDER BY a.name ASC`,
  );

  return result.rows;
};

export const getAuthorBySlug = async (slug) => {
  const authorResult = await query(
    `SELECT a.*,
            COUNT(p.id)::int AS product_count
     FROM authors a
     LEFT JOIN products p ON p.author_id = a.id
     WHERE a.slug = $1
     GROUP BY a.id`,
    [slug],
  );

  const author = authorResult.rows[0];

  if (!author) {
    throw new AppError("Không tìm thấy nhà thiết kế", 404);
  }

  const productResult = await query(
    `SELECT p.*, c.name AS category_name,
            a.name AS author_name, a.slug AS author_slug,
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
     ) comment_stats ON comment_stats.product_id = p.id
     WHERE p.author_id = $1
     ORDER BY p.created_at DESC`,
    [author.id],
  );

  return {
    ...author,
    products: productResult.rows,
  };
};

export const createAuthor = async ({ name, slug, bio = "", avatar_url = "" }) => {
  const nextSlug = toSlug(slug || name);
  const result = await query(
    `INSERT INTO authors (name, slug, bio, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name.trim(), nextSlug, bio.trim(), avatar_url.trim() || null],
  );

  return result.rows[0];
};

export const updateAuthor = async (id, payload) => {
  const current = await query("SELECT * FROM authors WHERE id = $1", [id]);

  if (!current.rows[0]) {
    throw new AppError("Không tìm thấy nhà thiết kế", 404);
  }

  const nextValue = {
    name: payload.name ?? current.rows[0].name,
    slug: payload.slug ? toSlug(payload.slug) : current.rows[0].slug,
    bio: payload.bio ?? current.rows[0].bio,
    avatar_url: payload.avatar_url ?? current.rows[0].avatar_url,
  };

  const result = await query(
    `UPDATE authors
     SET name = $1, slug = $2, bio = $3, avatar_url = $4
     WHERE id = $5
     RETURNING *`,
    [
      nextValue.name.trim(),
      nextValue.slug,
      nextValue.bio.trim(),
      nextValue.avatar_url?.trim() || null,
      id,
    ],
  );

  return result.rows[0];
};

export const deleteAuthor = async (id) => {
  const result = await query("DELETE FROM authors WHERE id = $1 RETURNING id", [id]);

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy nhà thiết kế", 404);
  }

  return { success: true };
};
