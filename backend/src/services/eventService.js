import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const serializeEvent = (event) => ({
  ...event,
  highlights: Array.isArray(event.highlights) ? event.highlights : [],
  content: Array.isArray(event.content) ? event.content : [],
  gallery_images: Array.isArray(event.gallery_images) ? event.gallery_images : [],
});

export const getEvents = async () => {
  const result = await query(
    `SELECT
       e.id,
       e.slug,
       e.title,
       e.eyebrow,
       e.subtitle,
       e.description,
       e.summary,
       e.highlights,
       e.content,
       e.gallery_images,
       e.banner_image_url,
       e.slot,
       e.sort_order,
       e.product_id,
       p.name AS product_name,
       p.image_url AS product_image_url
     FROM events e
     LEFT JOIN products p ON p.id = e.product_id
     WHERE e.is_active = TRUE
     ORDER BY CASE WHEN e.slot = 'hero' THEN 0 ELSE 1 END, e.sort_order ASC, e.id ASC`,
  );

  return {
    hero: result.rows.filter((event) => event.slot === "hero").map(serializeEvent),
    side: result.rows.filter((event) => event.slot === "side").map(serializeEvent),
  };
};

export const getEventBySlug = async (slug) => {
  const result = await query(
    `SELECT
       e.id,
       e.slug,
       e.title,
       e.eyebrow,
       e.subtitle,
       e.description,
       e.summary,
       e.highlights,
       e.content,
       e.gallery_images,
       e.banner_image_url,
       e.slot,
       e.sort_order,
       e.product_id,
       p.name AS product_name,
       p.image_url AS product_image_url
     FROM events e
     LEFT JOIN products p ON p.id = e.product_id
     WHERE e.slug = $1 AND e.is_active = TRUE
     LIMIT 1`,
    [slug],
  );

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy sự kiện", 404);
  }

  return serializeEvent(result.rows[0]);
};

export const getAdminEvents = async () => {
  const result = await query(
    `SELECT
       e.*,
       p.name AS product_name,
       p.image_url AS product_image_url
     FROM events e
     LEFT JOIN products p ON p.id = e.product_id
     ORDER BY CASE WHEN e.slot = 'hero' THEN 0 ELSE 1 END, e.sort_order ASC, e.id DESC`,
  );

  return result.rows.map(serializeEvent);
};

export const createEvent = async (payload) => {
  const nextSlug = toSlug(payload.slug || payload.title);
  const result = await query(
    `INSERT INTO events (
       slug, title, eyebrow, subtitle, description, summary, highlights, content, gallery_images,
       banner_image_url, slot, sort_order, is_active, product_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      nextSlug,
      payload.title.trim(),
      payload.eyebrow?.trim() || null,
      payload.subtitle?.trim() || null,
      payload.description?.trim() || "",
      payload.summary?.trim() || "",
      JSON.stringify(payload.highlights || []),
      JSON.stringify(payload.content || []),
      JSON.stringify(payload.gallery_images || []),
      payload.banner_image_url.trim(),
      payload.slot || "hero",
      Number(payload.sort_order || 0),
      payload.is_active ?? true,
      payload.product_id || null,
    ],
  );

  return serializeEvent(result.rows[0]);
};

export const updateEvent = async (id, payload) => {
  const current = await query("SELECT * FROM events WHERE id = $1", [id]);

  if (!current.rows[0]) {
    throw new AppError("Không tìm thấy sự kiện", 404);
  }

  const nextValue = {
    slug: payload.slug ? toSlug(payload.slug) : current.rows[0].slug,
    title: payload.title ?? current.rows[0].title,
    eyebrow: payload.eyebrow ?? current.rows[0].eyebrow,
    subtitle: payload.subtitle ?? current.rows[0].subtitle,
    description: payload.description ?? current.rows[0].description,
    summary: payload.summary ?? current.rows[0].summary,
    highlights: payload.highlights ?? current.rows[0].highlights,
    content: payload.content ?? current.rows[0].content,
    gallery_images: payload.gallery_images ?? current.rows[0].gallery_images,
    banner_image_url: payload.banner_image_url ?? current.rows[0].banner_image_url,
    slot: payload.slot ?? current.rows[0].slot,
    sort_order: payload.sort_order ?? current.rows[0].sort_order,
    is_active: payload.is_active ?? current.rows[0].is_active,
    product_id: payload.product_id ?? current.rows[0].product_id,
  };

  const result = await query(
    `UPDATE events
     SET slug = $1,
         title = $2,
         eyebrow = $3,
         subtitle = $4,
         description = $5,
         summary = $6,
         highlights = $7::jsonb,
         content = $8::jsonb,
         gallery_images = $9::jsonb,
         banner_image_url = $10,
         slot = $11,
         sort_order = $12,
         is_active = $13,
         product_id = $14
     WHERE id = $15
     RETURNING *`,
    [
      nextValue.slug,
      nextValue.title.trim(),
      nextValue.eyebrow?.trim() || null,
      nextValue.subtitle?.trim() || null,
      nextValue.description?.trim() || "",
      nextValue.summary?.trim() || "",
      JSON.stringify(nextValue.highlights || []),
      JSON.stringify(nextValue.content || []),
      JSON.stringify(nextValue.gallery_images || []),
      nextValue.banner_image_url.trim(),
      nextValue.slot,
      Number(nextValue.sort_order || 0),
      Boolean(nextValue.is_active),
      nextValue.product_id || null,
      id,
    ],
  );

  return serializeEvent(result.rows[0]);
};

export const deleteEvent = async (id) => {
  const result = await query("DELETE FROM events WHERE id = $1 RETURNING id", [id]);

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy sự kiện", 404);
  }

  return { success: true };
};
