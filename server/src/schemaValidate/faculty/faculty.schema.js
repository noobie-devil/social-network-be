import Joi from "joi";

const createFacultySchema = Joi.object({
    code: Joi.string()
        .required()
        .not(null)
        .not(''),
    name: Joi.string()
        .required()
        .not(null)
        .not('')
});

const updateFacultySchema = Joi.object({
    code: Joi.string().allow(null).not(''),
    name: Joi.string().allow(null).not('')
});


export {
    createFacultySchema,
    updateFacultySchema
}
