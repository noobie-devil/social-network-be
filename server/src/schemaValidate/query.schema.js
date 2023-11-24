import Joi from "joi";

const baseQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    size: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional()
})

export {
    baseQuerySchema
}
