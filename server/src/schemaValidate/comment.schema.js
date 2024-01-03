import Joi from 'joi';
import {isValidMongoId} from "../utils/global.utils.js";

const sendCommentSchema = Joi.object({
    text: Joi.when('images', {
        is: Joi.array().items(Joi.string().custom(isValidMongoId)).required(),
        then: Joi.string().allow('').optional(),
        otherwise: Joi.string().required()
    }),
    images: Joi.array().items(Joi.string().custom(isValidMongoId)).optional(),
})

export {
    sendCommentSchema
}