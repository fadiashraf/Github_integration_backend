import { logger } from "../config/logger.config.js";
import { ApiError } from "./ApiError.js";


export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Log the error
      logger.error('AsyncHandler Error:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });

      if (res.headersSent) {
        return next(error);
      }

      // Convert error to ApiError if it's not already
      const apiError = error instanceof ApiError
        ? error
        : new ApiError(
          error.statusCode || 500,
          error.message || 'Internal Server Error',
          false,
          error.stack
        );

      next(apiError);
    }
  };
};