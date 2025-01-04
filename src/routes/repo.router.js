import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.middleware.js";
import { repoValidation } from "../validation/repo.validation.js";
import { repoController } from "../controllers/repo.controller.js";


const router = new Router();

router.use(authenticate)
router.get('/', validate(repoValidation.getReposWithDetails), repoController.getReposWithDetails);


export { router as reposRouter }
