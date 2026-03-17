import Stripe from "stripe";
import { env } from "./env.js";
import { AppError } from "../utils/AppError.js";

let stripeClient;

export const getStripeClient = () => {
  if (!env.stripeSecretKey) {
    throw new AppError("Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env", 500);
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }

  return stripeClient;
};
