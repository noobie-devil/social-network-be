import Joi from "joi";


const loginSchema = Joi.object({
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "vn"] }
    }).required().max(50),
    password: Joi.string().required().min(8).max(256)
});


const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});


const registerSchema = Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow : ["com", "vn"]},
    }).required().max(50),
    password: Joi.string().required().min(8).max(256),
});

export {
    loginSchema,
    registerSchema,
    refreshTokenSchema
}
