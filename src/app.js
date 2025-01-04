import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.config.js';
import { morganStream } from './config/logger.config.js';
import session from 'express-session';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { initializeRoutes } from './routes/index.js';

export const createApp = () => {
    const app = express();
    app.use(cors({
        origin: 'http://localhost:4200',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 10 // 10 minutes
        }
    }));
    app.use(helmet());
    // app.use(rateLimit(config.rateLimit));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(compression());

    if (config.env !== 'test') {
        app.use(morgan('combined', { stream: morganStream }));
    }

    app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
    initializeRoutes(app);

    app.use(notFoundHandler)
    app.use(errorHandler)

    return app;
};