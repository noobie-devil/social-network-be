import Joi from "joi";
import {maximumCurrentYear} from "../../utils/validateMongodbId.js";

const createEnrollmentYearSchema = Joi.object({
    name: Joi.string()
        .required()
        .not(null)
        .not(''),
    startYear: Joi.number()
        .integer()
        .min(1962)
        .custom(maximumCurrentYear, "Invalid startYear")
        .required()
        .not(null)
        .not('')
})

const updateEnrollmentYearSchema = Joi.object({
    name: Joi.string().allow(null).not(''),
    startYear: Joi.number()
        .integer()
        .min(1962)
        .custom(maximumCurrentYear, "Invalid startYear")
        .allow(null)
        .not('')
});

export {
    createEnrollmentYearSchema,
    updateEnrollmentYearSchema
}
