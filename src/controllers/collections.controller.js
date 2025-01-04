import { config } from '../config/env.config.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { collectionsService } from '../services/collections.service.js'

export const CollectionController = {
    getCollections: asyncHandler(async (req, res) => {
        const collections = collectionsService.getCollections();
        res.json({ collections });
    }),
    getCollectionData: asyncHandler(async (req, res) => {


        const { collection } = req.params;
        const { startRow, endRow, sortModel = '{}', search = '', filterModel = '{}' } = req.query;
        const data = await collectionsService.getCollectionData({ collectionName: collection, startRow, endRow, sortModel: JSON.parse(sortModel), filterModel: JSON.parse(filterModel), search })


        res.json(data);
    }),



};

