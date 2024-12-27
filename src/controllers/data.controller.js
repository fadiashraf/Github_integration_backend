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
        const { startRow, endRow, sortModel, search = '', filterModel = '{}' } = req.query;
        const data = await dataService.getCollectionData({ collectionName: collection, startRow, endRow, sortModel: JSON.parse(sortModel), filterModel: JSON.parse(filterModel), search })


        res.json(data);
    }),

};

