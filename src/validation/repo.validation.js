import Joi from 'joi';

export const repoValidation = {
    getReposWithDetails: {
        query: Joi.object({
            startRow: Joi.number().optional().default(0),
            endRow: Joi.number().optional().default(100),
            sortModel: Joi.string().optional(),
            filterModel: Joi.string().optional(),
            search: Joi.string().allow('').optional()
        }).unknown(false)
    }
}