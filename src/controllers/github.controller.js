import { ApiError } from '../helpers/ApiError.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { githubService } from '../services/github.service.js';


export const githubController = {
  initiateOAuth: asyncHandler(async (req, res) => {
    const { authUrl, state } = await githubService.generateAuthUrl();
    req.session.oauthState = state;
    return res.json({ url: authUrl });
  }),

  verifyToken: asyncHandler(async (req, res) => {
    const { integrationId } = req.integration;
    const integration = await githubService.getGithubIntegration(integrationId)
    return res.json({ ...integration, success: true, isAuthenticated: true })
  }),

  handleCallback: asyncHandler(async (req, res) => {
    const { code, state } = req.query;

    // Validate state to prevent CSRF attacks
    if (!state || state !== req.session.oauthState) {
      delete req.session.oauthState;
      throw new ApiError(400, 'Invalid state parameter');
    }

    const userDetails = await githubService.handleCallback({ code, state });

    return res.json({
      success: true,
      isAuthenticated: true,
      ...userDetails,
    });
  }),

  startSync: asyncHandler(async (req, res) => {
    const { integrationId } = req.integration;
    await githubService.startSync(integrationId)

    return res. json({ success: true, message: 'Data is syncing!' });
  }),

  getStatus: asyncHandler(async (req, res) => {
    const { integrationId } = req.integration;
    const status = await githubService.getStatus(integrationId);

    return res.json({ success: true, status });
  }),

  removeConnection: asyncHandler(async (req, res) => {
    const { integrationId } = req.integration;
    await githubService.removeConnection(integrationId);


    return res.json({ success: true, message: 'Connection removed successfully.' });
  }),
};