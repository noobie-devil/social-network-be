import Joi from "joi";


const createAdminSchema = Joi.object({
    email: Joi.string()
        .email({
            minDomainSegments:2,
            tlds: {allow: ['com', 'vn']}
        })
        .required(),
})
