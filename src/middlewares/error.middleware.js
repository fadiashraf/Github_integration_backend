import httpStatus from 'http-status';
import { ApiError } from '../helpers/ApiError.js';
import { config } from '../config/env.config.js';
import { logger } from '../config/logger.config.js';
import { MongooseError } from 'mongoose';



export const notFoundHandler = (req, res, next) => {
    next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`));
};

export const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode ?? httpStatus.INTERNAL_SERVER_ERROR;
        const message = error instanceof MongooseError ? 'Internal Error' : error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!err.isOperational) {
        logger.error(err)
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }

    res.locals.errorMessage = err.message;

    const response = {
        success: false,
        code: statusCode,
        message,
    };

    if (config.env === 'development') {
        logger.error(err);
    }

    res.status(statusCode).send(response);
};

