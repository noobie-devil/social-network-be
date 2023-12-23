import Joi from "joi";
import {isValidMongoId} from "../utils/global.utils.js";


const queryAdminSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional().allow(''),
    group: Joi.string().optional()
})

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

const updateAdminToGroupSchema = Joi.object({
    adminId: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id")
})


const updateAdminGroupSchema = Joi.object({
    groupName: Joi.string()
        .allow(null)
        .not('')
})

const changeAdminPasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .min(8)
        .max(256),
    newPassword: Joi.string()
        .required()
        .min(8)
        .max(256)
})

const changeAdminUsernameSchema = Joi.object({
    username: Joi.string()
        .required()
        .min(1)
        .not(null)
})

export {
    queryAdminSchema,
    createAdminSchema,
    createAdminGroupSchema,
    updateAdminToGroupSchema,
    updateAdminGroupSchema,
    changeAdminPasswordSchema,
    changeAdminUsernameSchema
}
