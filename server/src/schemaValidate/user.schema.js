import Joi from 'joi'
import {isValidMongoId} from "../utils/global.utils.js";
import moment from "moment";

const respondFriendRequestSchema = Joi.object({
    status: Joi.string()
        .valid("Rejected", "Accepted")
        .required(),
    friendshipId: Joi.string()
        .required()
        .custom(isValidMongoId, "Invalid Id")
});


const isValidUserType = (value, helpers) => {
    const validUserTypes = [1,2,3]
    if(validUserTypes.includes(value)) {
        return value
    }
    return helpers.error('any.invalid')
}

const isValidDateStringFormat = (value, helpers) => {
    if(moment(value, "DD/MM/YYYY", true).isValid()) {
        return value
    }
    return helpers.error('any.invalid')
}

const changePasswordUserSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .min(8)
        .max(256),
    newPassword: Joi.string()
        .required()
        .min(8)
        .max(256)
})

const updateUserSchema = Joi.object({
    identityCode: Joi.string()
        .optional()
        .allow(null)
        .allow(""),
    homeTown: Joi.string()
        .optional()
        .allow(null)
        .allow(""),
    introduce: Joi.string()
        .optional()
        .allow(null)
        .allow("")
        .max(150),
    type: Joi.number()
        .required()
        .not(null)
        .custom(isValidUserType, "Invalid user type"),
    username: Joi.string()
        .optional()
        .max(50)
        .not("")
        .allow(null),
    details: Joi
        .optional()
        .allow(null)
        .when("type", {
        is: 1,
        then: Joi.object({
            graduated: Joi
                .boolean()
                .optional()
                .required(),
            classCode: Joi.string()
                .allow("")
                .optional(),
        }),
        otherwise: Joi.when("type", {
            is: 2,
            then: Joi.object({
                faculty: Joi.string()
                    .optional()
                    .allow(null)
                    .custom(isValidMongoId, "Invalid Id")
            }),
            otherwise: Joi.object({
                registeredMajor: Joi.string()
                    .optional()
                    .allow(null)
                    .custom(isValidMongoId, "Invalid Id"),
                highSchool: Joi.string()
                    .optional()
                    .allow(null)
                    .not("")
            })
        })
    })
})

const createUserSchema = Joi.object({
    identityCode: Joi.string()
        .required()
        .not(null)
        .not(""),
    firstName: Joi.string()
        .required()
        .min(2)
        .max(50),
    lastName: Joi.string()
        .required()
        .min(2)
        .max(50),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "vn"]}
        })
        .required(),
    password: Joi.string()
        .required()
        .min(8)
        .max(256),
    homeTown: Joi.string()
        .required()
        .not(null)
        .not(""),
    birthdate: Joi.string()
        .required()
        .not(null)
        .not("")
        .custom(isValidDateStringFormat, "Invalid format date. Ex: DD/MM/YYYY"),
    type: Joi.number()
        .required()
        .not(null)
        .custom(isValidUserType, "Invalid user type"),
    details: Joi.when("type", {
        is: 1,
        then: Joi.object({
            graduated: Joi.boolean()
                .required(),
            classCode: Joi.string()
                .allow("")
                .optional(),
            faculty: Joi.string()
                .required()
                .custom(isValidMongoId, "Invalid Id"),
            major: Joi.string()
                .required()
                .custom(isValidMongoId, "Invalid Id"),
            enrollmentYear: Joi.string()
                .required()
                .custom(isValidMongoId, "Invalid Id"),
        }),
        otherwise: Joi.when("type", {
            is: 2,
            then: Joi.object({
                faculty: Joi.string()
                    .required()
                    .custom(isValidMongoId, "Invalid Id")
            }),
            otherwise: Joi.object({
                registeredMajor: Joi.string()
                    .required()
                    .custom(isValidMongoId, "Invalid Id"),
                highSchool: Joi.string()
                    .required()
                    .not(null)
                    .not("")
            })
        })
    })
})

export {
    respondFriendRequestSchema,
    createUserSchema,
    updateUserSchema,
    changePasswordUserSchema
}
