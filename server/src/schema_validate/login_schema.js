import Joi from "joi";

export const loginSchema = Joi.object({
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "vn"] }
    }).required().max(50),
    password: Joi.string().required().min(8).max(256)
});
