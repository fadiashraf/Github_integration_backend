import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { CollectionController } from "../controllers/collections.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { githubValidation } from "../validation/github.validation.js";
import { githubController } from "../controllers/github.controller.js";


const router = new Router();

router.use(authenticate)
router.get('/collections', CollectionController.getCollections);
router.get('/collections/:collection', validate(githubValidation.getCollectionData), CollectionController.getCollectionData);
router.post('/sync', githubController.startSync);


export { router as collectionsRouter }