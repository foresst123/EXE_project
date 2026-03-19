export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: "Không tìm thấy đường dẫn API" });
};

export const errorHandler = (error, _req, res) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Lỗi máy chủ nội bộ",
  });
};
