import Joi from 'joi';
import {isValidMongoId} from "../../utils/global.utils.js";
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
    createMajorSchema,
    updateMajorSchema
}
