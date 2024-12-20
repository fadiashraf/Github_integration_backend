import Joi from "joi";
import { ApiError } from "../helpers/ApiError.js";


const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj
    }, {})

}


export const validate = (schema) => (req, res, next) => {
    const validateSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validateSchema));
    const {value, error } = Joi.compile(validateSchema).prefs({ errors: { label: "key" } }).validate(object);

    if(error){
        const errorMessage =error.details.map((details)=>details.message).join(', ')
        return next(new ApiError(400,errorMessage))
    }

    Object.assign(req,value)
    return next()
}   