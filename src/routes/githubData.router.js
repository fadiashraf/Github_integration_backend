import { Router } from "express";
import { githubController } from "../controllers/github.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { dataController } from "../controllers/data.controller.js";


const router = new Router();

router.use(authenticate)
router.get('/collections', dataController.getCollections);
router.get('/collections/:collection', dataController.getCollectionData);
router.post('/sync', githubController.startSync);


export { router as githubDataRoutes }