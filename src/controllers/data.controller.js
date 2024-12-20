import { config } from '../config/env.config.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { dataService } from '../services/data.service.js'

export const dataController = {
    getCollections: asyncHandler(async (req, res) => {
        const collections = dataService.getCollections();
        res.json({ collections });
    }),
    getCollectionData: asyncHandler(async (req, res) => {


        const { collection } = req.params;
        const { page = 1, pageSize = config.pageSize, search } = req.query;
        const data = await dataService.getCollectionData({ collectionName: collection, page, pageSize, search })


        res.json(data);
    }),

};

