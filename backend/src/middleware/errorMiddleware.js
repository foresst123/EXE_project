export const notFoundHandler = (req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Không tìm thấy đường dẫn API" });
};

export const errorHandler = (error, req, res) => {
  const statusCode = error.statusCode || 500;
  const requestLine = `${req.method} ${req.originalUrl}`;

  console.error(`[ERR] ${requestLine} -> ${statusCode}: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }

  const payload = {
    message: error.message || "Lỗi máy chủ nội bộ",
  };

  if (process.env.NODE_ENV !== "production" && error.stack) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};
