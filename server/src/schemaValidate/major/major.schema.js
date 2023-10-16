import Joi from 'joi';
import {isValidMongoId} from "../../utils/validateMongodbId.js";

const createMajorSchema = Joi.object({
    code: Joi.string()
        .required()
        .not(null)
        .not(''),
    name: Joi.string()
        .required()
        .not(null)
        .not(''),
    facultyId: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id")
})

const updateMajorSchema = Joi.object({
    code: Joi.string().allow(null).not(''),
    name: Joi.string().allow(null).not('')
});

export {
    createMajorSchema,
    updateMajorSchema
}
