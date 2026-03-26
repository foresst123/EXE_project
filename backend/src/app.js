import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { stripeWebhookHandler } from "./controllers/orderController.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { asyncHandler } from "./utils/asyncHandler.js";

const app = express();

app.use((req, res, next) => {
  const startedAt = Date.now();
  const requestMeta = `[REQ] ${req.method} ${req.originalUrl}`;
  console.log(requestMeta);

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`,
    );
  });

  next();
});

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.post(
  "/api/orders/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(stripeWebhookHandler),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
