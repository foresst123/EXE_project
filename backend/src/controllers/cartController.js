import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../services/cartService.js";

export const getCartHandler = async (req, res) => {
  const cart = await getCart(req.user.id);
  res.json(cart);
};

export const addToCartHandler = async (req, res) => {
  const cart = await addToCart(req.user.id, req.body.product_id, req.body.quantity);
  res.json(cart);
};

export const removeFromCartHandler = async (req, res) => {
  const cart = await removeFromCart(req.user.id, req.body.product_id);
  res.json(cart);
};

export const updateCartQuantityHandler = async (req, res) => {
  const cart = await updateCartQuantity(req.user.id, req.body.product_id, req.body.quantity);
  res.json(cart);
};
