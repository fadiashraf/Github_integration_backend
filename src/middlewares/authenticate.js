import httpStatus from 'http-status';
import { ApiError } from '../helpers/ApiError.js';
import { verifyToken } from '../services/token.service.js';
import { githubService } from '../services/github.service.js'

export const authenticate = async (req, res, next) => {
  try {
    let token = req.header('Authorization');
    token = token?.replace('Bearer ', '');
    if (!token) return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));

    const decoded = verifyToken(token);

    let integrationId = decoded.sub;
    const integration = await githubService.getGithubIntegration(integrationId)

    if (!integration || !integration.isActive) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
    const { email, name } = integration
    req.integration = { integrationId, name, email };
    next();
  } catch (error) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));
  }
};

