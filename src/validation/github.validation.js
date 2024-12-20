import Joi from 'joi';

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
};