const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);

  // Set status code and pass the error
  if (!res.headersSent) {
    res.status(404);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    // If headers are already sent, delegate to the default Express error handler
    return next(err);
  }

  // Determine appropriate status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "Server Error";

  // Send JSON response with error details
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
