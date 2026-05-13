const logger = require("../utils/logger");

module.exports = function errorMiddleware(err, req, res, _next) {
  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
