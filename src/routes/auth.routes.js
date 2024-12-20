import { Router } from "express";
import { githubController } from "../controllers/github.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { githubValidation } from "../validation/github.validation.js";
import { authenticate } from "../middlewares/authenticate.js";



const router = new Router();


router.get('/github/url', githubController.initiateOAuth);
router.get('/github/callback', validate(githubValidation.oauthCallback), githubController.handleCallback);
router.get('/verify', authenticate, githubController.verifyToken);
router.get('/status', authenticate, githubController.getStatus);
router.delete('/github/integration', authenticate, githubController.removeConnection);


export { router as authRoutes }