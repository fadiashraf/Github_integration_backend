import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { config } from "../config/env.config.js";

export const generateToken = async (integrationId, options = {}) => {
  options.expiresIn = config.jwt.accessExpirationMinutes + 'm';
  const claims = createJwtPayload(integrationId);
  return jwt.sign(claims, config.jwt.secret, options);
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

export const createJwtPayload = (integrationId) => {
  return {
    sub: integrationId,
    iat: moment().unix(),
    jti: uuidv4(),
    iss: config.jwt.issuer,
  };
};

