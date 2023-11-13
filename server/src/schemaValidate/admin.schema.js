import Joi from "joi";
import {isValidMongoId} from "../utils/global.utils.js";


const createAdminSchema = Joi.object({
    email: Joi.string()
        .email({
            minDomainSegments:2,
            tlds: {allow: ['com', 'vn']}
        })
        .required(),
    password: Joi.string()
        .required()
        .min(8)
        .max(256),
})

const createAdminGroupSchema = Joi.object({
    groupName: Joi.string()
        .required()
        .min(1)
        .max(32)
})

const updateAdminToGroup = Joi.object({
    adminId: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id")
})


export {
    createAdminSchema,
    createAdminGroupSchema,
    updateAdminToGroup
}
