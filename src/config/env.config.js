import dotenv from 'dotenv';
import joi from 'joi';
import path from 'path';

dotenv.config();

const envSchema = joi.object({
  NODE_ENV: joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: joi.number().default(3000),
  MONGODB_URI: joi.string().required(),
  GITHUB_CLIENT_ID: joi.string().required(),
  GITHUB_CLIENT_SECRET: joi.string().required(),
  GITHUB_REDIRECT_URI: joi.string().required(),
  API_VERSION: joi.string().default('v1'),
  LOG_LEVEL: joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  RATE_LIMIT_WINDOW_MS: joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: joi.number().default(100),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  github: {
    clientId: envVars.GITHUB_CLIENT_ID,
    clientSecret: envVars.GITHUB_CLIENT_SECRET,
    redirectUri: envVars.GITHUB_REDIRECT_URI,
    scope: 'read:org read:user repo',
    apiUrl: 'https://api.github.com',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
  },
  apiVersion: envVars.API_VERSION,
  logLevel: envVars.LOG_LEVEL,
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  jwt:{
    issuer:'test',
    secret:'secret',
    accessExpirationMinutes:60,
    
  },
  pageSize: 50,
};