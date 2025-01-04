import Joi from 'joi';
import { collectionsService } from '../services/collections.service.js';

export const githubValidation = {
  oauthCallback: {
    query: Joi.object({
      code: Joi.string().required(),
      state: Joi.string().required()
    })
  },

  getStatus: {
    params: Joi.object({
      integrationId: Joi.string().required().hex().length(24)
    })
  },

  removeIntegration: {
    params: Joi.object({
      integrationId: Joi.string().required().hex().length(24)
    })
  },

  getCollectionData: {
    params: Joi.object({
      collection: Joi.string().required().valid(...collectionsService.getCollections().map(col => col.collectionName)),
    }).unknown(false),
    query: Joi.object({
      startRow: Joi.number().optional().default(0),
      endRow: Joi.number().optional().default(100),
      sortModel: Joi.string().optional(),
      filterModel: Joi.string().optional(),
      search: Joi.string().allow('').optional()
    }).unknown(false)
  }

  
};