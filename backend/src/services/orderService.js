import { pool, query } from "../config/db.js";
import { getCart } from "./cartService.js";
import { AppError } from "../utils/AppError.js";
import { getStripeClient } from "../config/stripe.js";
import { env } from "../config/env.js";

const getOrderItems = async (orderId) => {
  const result = await query(
    `SELECT oi.id, oi.quantity, oi.price, p.name, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId],
  );

  return result.rows;
};

const getOrderWithItems = async (orderId) => {
  const result = await query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [orderId],
  );

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy đơn hàng", 404);
  }

  return {
    ...result.rows[0],
    items: await getOrderItems(orderId),
  };
};

export const createCheckoutSession = async (user) => {
  const cart = await getCart(user.id);

  if (!cart.items.length) {
    throw new AppError("Giỏ hàng đang trống", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item of cart.items) {
      if (item.quantity > item.stock) {
        throw new AppError(`Tồn kho không đủ cho sản phẩm ${item.name}`, 400);
      }
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, payment_status, total_price)
       VALUES ($1, 'awaiting_payment', 'pending', $2)
       RETURNING *`,
      [user.id, cart.total],
    );

    const order = orderResult.rows[0];

    for (const item of cart.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price],
      );
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.clientUrl}/checkout/result?orderId=${order.id}&status=success`,
      cancel_url: `${env.clientUrl}/checkout/result?orderId=${order.id}&status=cancelled`,
      customer_email: user.email,
      metadata: {
        orderId: String(order.id),
        userId: String(user.id),
      },
      line_items: cart.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "vnd",
          unit_amount: Math.round(Number(item.price)),
          product_data: {
            name: item.name,
            images: item.image_url ? [item.image_url] : [],
          },
        },
      })),
    });

    await client.query(
      `UPDATE orders
       SET stripe_session_id = $1
       WHERE id = $2`,
      [session.id, order.id],
    );

    await client.query("COMMIT");

    return {
      orderId: order.id,
      checkoutUrl: session.url,
      paymentStatus: "pending",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getOrders = async (user) => {
  const isAdmin = user.role === "admin";
  const result = await query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ${isAdmin ? "" : "WHERE o.user_id = $1"}
     ORDER BY o.created_at DESC`,
    isAdmin ? [] : [user.id],
  );

  return Promise.all(
    result.rows.map(async (order) => ({
      ...order,
      items: await getOrderItems(order.id),
    })),
  );
};

export const getOrderById = async (id, user) => {
  const order = await getOrderWithItems(id);

  if (user.role !== "admin" && order.user_id !== user.id) {
    throw new AppError("Bạn không có quyền truy cập đơn hàng này", 403);
  }

  return order;
};

export const updateOrderStatus = async (id, status) => {
  const result = await query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, id],
  );

  if (!result.rows[0]) {
    throw new AppError("Không tìm thấy đơn hàng", 404);
  }

  return {
    ...result.rows[0],
    items: await getOrderItems(id),
  };
};

const finalizePaidOrder = async (client, order, paymentIntentId) => {
  const itemResult = await client.query(
    `SELECT oi.product_id, oi.quantity, p.name, p.stock
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     FOR UPDATE OF p`,
    [order.id],
  );

  for (const item of itemResult.rows) {
    if (item.quantity > item.stock) {
      await client.query(
        `UPDATE orders
         SET payment_status = 'failed', status = 'payment_failed'
         WHERE id = $1`,
        [order.id],
      );
      return { received: true, stockFailure: item.name };
    }
  }

  for (const item of itemResult.rows) {
    await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [
      item.quantity,
      item.product_id,
    ]);
  }

  await client.query(
    `DELETE FROM cart_items
     WHERE user_id = $1
     AND product_id IN (SELECT product_id FROM order_items WHERE order_id = $2)`,
    [order.user_id, order.id],
  );

  await client.query(
    `UPDATE orders
     SET payment_status = 'paid',
         status = 'processing',
         paid_at = NOW(),
         payment_intent_id = $1
     WHERE id = $2`,
    [paymentIntentId || null, order.id],
  );

  return { received: true, orderId: order.id };
};

export const confirmOrderPayment = async (id, user) => {
  const stripe = getStripeClient();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `SELECT *
       FROM orders
       WHERE id = $1
       FOR UPDATE`,
      [id],
    );
    const order = orderResult.rows[0];

    if (!order) {
      throw new AppError("Không tìm thấy đơn hàng", 404);
    }

    if (user.role !== "admin" && order.user_id !== user.id) {
      throw new AppError("Bạn không có quyền xác nhận đơn hàng này", 403);
    }

    if (order.payment_status === "paid") {
      await client.query("COMMIT");
      return getOrderWithItems(order.id);
    }

    if (!order.stripe_session_id) {
      throw new AppError("Đơn hàng này chưa có phiên Stripe hợp lệ", 400);
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete" ||
      session.payment_status === "no_payment_required";

    if (!paid) {
      await client.query("COMMIT");
      return getOrderWithItems(order.id);
    }

    await finalizePaidOrder(client, order, session.payment_intent);
    await client.query("COMMIT");
    return getOrderWithItems(order.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const handleStripeWebhook = async (signature, rawBody) => {
  if (!env.stripeWebhookSecret) {
    throw new AppError("Chưa cấu hình Stripe webhook secret", 500);
  }

  const stripe = getStripeClient();
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch {
    throw new AppError("Chữ ký webhook Stripe không hợp lệ", 400);
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return { received: true, ignored: true };
  }

  const session = event.data.object;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `SELECT *
       FROM orders
       WHERE stripe_session_id = $1
       FOR UPDATE`,
      [session.id],
    );

    const order = orderResult.rows[0];

    if (!order) {
      await client.query("COMMIT");
      return { received: true, missingOrder: true };
    }

    if (order.payment_status === "paid") {
      await client.query("COMMIT");
      return { received: true, alreadyProcessed: true };
    }

    const result = await finalizePaidOrder(client, order, session.payment_intent);

    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
