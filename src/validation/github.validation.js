import Joi from 'joi';
import { dataService } from '../services/data.service.js';

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
      collection: Joi.string().required().valid(...dataService.getCollections().map(col => col.collectionName)),
    }).unknown(false),
    query: Joi.object({
      search: Joi.string().optional(),
      pageSize: Joi.number().optional(),
      page: Joi.number().optional()
    }).unknown(false)
  }
};