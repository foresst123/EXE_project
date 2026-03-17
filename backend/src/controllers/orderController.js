import {
  createCheckoutSession,
  getOrderById,
  getOrders,
  handleStripeWebhook,
  updateOrderStatus,
} from "../services/orderService.js";

export const createCheckoutSessionHandler = async (req, res) => {
  const session = await createCheckoutSession(req.user);
  res.status(201).json(session);
};

export const getOrdersHandler = async (req, res) => {
  const orders = await getOrders(req.user);
  res.json(orders);
};

export const getOrderHandler = async (req, res) => {
  const order = await getOrderById(req.params.id, req.user);
  res.json(order);
};

export const updateOrderStatusHandler = async (req, res) => {
  const order = await updateOrderStatus(req.params.id, req.body.status);
  res.json(order);
};

export const stripeWebhookHandler = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const result = await handleStripeWebhook(signature, req.body);
  res.json(result);
};
