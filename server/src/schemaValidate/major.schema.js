import Joi from 'joi';
import {isValidMongoId} from "../utils/global.utils.js";


const queryMajorSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional().allow(''),
    lang: Joi.string().valid('vi', 'en').optional(),
    facultyId: Joi.string().optional().allow('')
})
const createMajorSchema = Joi.object({
    code: Joi.string()
        .required()
        .not(null)
        .not(''),
    name: Joi.object().pattern(
        Joi.string().valid('en', 'vi'),
        Joi.string().required()
    ).required(),
    facultyId: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id")
})

const updateMajorSchema = Joi.object({
    code: Joi.string().allow(null).not(''),
    name: Joi.object().pattern(
        Joi.string().valid('en', 'vi'),
        Joi.string().required()
    ).allow(null)
});



export {
    queryMajorSchema,
    createMajorSchema,
    updateMajorSchema
}
