import Joi from "joi";
import {isValidMongoId} from "../utils/global.utils.js";


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

export {
    createPermissionSchema
}
