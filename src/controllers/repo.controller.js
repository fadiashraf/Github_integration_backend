import { asyncHandler } from '../helpers/asyncHandler.js';
import { repoService } from '../services/repo.service.js';


export const repoController = {

    getReposWithDetails: asyncHandler(async (req, res) => {
        const { startRow, endRow, sortModel = '{}', search = '', filterModel = '{}' } = req.query;
        const data = await repoService.getReposWithDetails({ startRow, endRow, sortModel: JSON.parse(sortModel), filterModel: JSON.parse(filterModel), search })

        res.json(data);
    }),
   



};

