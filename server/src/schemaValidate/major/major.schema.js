import Joi from 'joi';
import {isValidMongoId} from "../../utils/global.utils.js";

// const createMajorSchema = Joi.object({
//     code: Joi.string()
//         .required()
//         .not(null)
//         .not(''),
//     name: Joi.string()
//         .required()
//         .not(null)
//         .not(''),
//     facultyId: Joi.string()
//         .required()
//         .custom(isValidMongoId, "Invalid Id")
// })

const createMajorSchema = Joi.object({
    code: Joi.string()
        .required()
        .not(null)
        .not(''),
    name: Joi.array().unique('lang').items(
        Joi.object({
            lang: Joi.string().valid('en', 'vi').required(),
            value: Joi.string().required().not(null)
        })
    ).min(1).required(),
    facultyId: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id")
})

const updateMajorSchema = Joi.object({
    code: Joi.string().allow(null).not(''),
    name: Joi.array().unique('lang').items(
        Joi.object({
            lang: Joi.string().valid('en', 'vi').required(),
            value: Joi.string().required().not(null)
        })
    ).min(1).required()
});



export {
    createMajorSchema,
    updateMajorSchema
}
