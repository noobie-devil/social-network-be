import Joi from 'joi';
import {isValidMongoId} from "../utils/global.utils.js";

/* userAuthor or userPageAuthor (only one in them) */
/* group is optional, need to check with isValidMongoId */
/* content can only null when postResources != null */
/* postResource is optional and each of value in its must be valid with isValidMongoId */
/* sharedPost is optional and its value must be valid with isValidMongoId */
/* privacyMode is optional but its value must be valid in [0,1,2] */
/* tags is optional but each of its value must be # null */

const createPostSchema = Joi.object({
    userAuthor: Joi.string().custom(isValidMongoId),
    userPageAuthor: Joi.string().custom(isValidMongoId),
    group: Joi.string().custom(isValidMongoId),
    content: Joi.when('postResources', {
        is: Joi.array().items(Joi.string().custom(isValidMongoId)).required(),
        then: Joi.string().allow('').optional(),
        otherwise: Joi.string().required()
    }),
    postResources: Joi.array().items(Joi.string().custom(isValidMongoId)).optional(),
    sharedPost: Joi.string().custom(isValidMongoId).optional(),
    privacyMode: Joi.number().valid(0,1,2).optional(),
    tags: Joi.array().items(Joi.string().required()).optional()
})
    .without('userAuthor', 'userPageAuthor')
    .without('userPageAuthor', 'userAuthor')

export {
    createPostSchema
}
