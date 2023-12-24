import Joi from "joi";
import {isValidMongoId} from "../utils/global.utils.js";
import {getResourcePermission} from "../repositories/permission.repo.js";



const getPermissionsByAdminIdSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
})

const createResourceSchema = Joi.object({
    resourceName: Joi.string()
        .required()
        .not(null),
    othersPermission: Joi.number()
        .optional()
        .not(null)
        .min(0)
        .max(7),
})

const updateResourceSchema = Joi.object({
    resourceName: Joi.string()
        .optional()
        .not("")
        .allow(null),
    othersPermission: Joi.number()
        .optional()
        .allow(null)
        .min(0)
        .max(7)
})


const getResourcePermissionSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    search: Joi.string().optional().allow(''),
    actorTypeFilter: Joi.string().optional()
        .valid("Admin", "AdminGroup"),
    resourceId: Joi.string().optional().allow("")
})

const createPermissionSchema = Joi.object({
    resourceName: Joi.string()
        .required()
        .not(null),
    othersPermission: Joi.number()
        .optional()
        .not(null)
        .min(0)
        .max(7),
    actor: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id"),
    actorType: Joi.string()
        .required()
        .valid('Admin', 'AdminGroup')
        .not(null),
    operation: Joi.number()
        .required()
        .min(0)
        .max(7)
})

const createResourcePermissionSchema = Joi.object({
    resource: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id"),
    actor: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id"),
    actorType: Joi.string()
        .required()
        .valid("Admin", "AdminGroup")
        .not(null),
    operation: Joi.number()
        .required()
        .min(0)
        .max(7)
})

const updateResourcePermissionSchema = Joi.object({
    operation: Joi.number()
        .required()
        .not(null)
        .min(0)
        .max(7)
})

export {
    createPermissionSchema,
    createResourceSchema,
    updateResourceSchema,
    getPermissionsByAdminIdSchema,
    getResourcePermissionSchema,
    createResourcePermissionSchema,
    updateResourcePermissionSchema,
}
