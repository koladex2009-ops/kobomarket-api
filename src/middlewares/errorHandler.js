const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found`, details: null },
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'Something went wrong' : err.message,
      details: err.details || null,
    },
  });
};

module.exports = { notFound, errorHandler };