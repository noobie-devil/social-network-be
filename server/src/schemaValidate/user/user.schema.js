import Joi from 'joi'
import {isValidMongoId} from "../../utils/validateMongodbId.js";
import moment from "moment";

const respondFriendRequestSchema = Joi.object({
    status: Joi.string()
        .valid("Rejected", "Accepted")
        .required(),
    friendShipId: Joi.string()
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

const updateUserSchema = Joi.object({
    identityCode: Joi.string()
        .required()
        .not(null)
        .not(""),
    homeTown: Joi.string()
        .required()
        .not(null)
        .not(""),
    introduce: Joi.string()
        .optional()
        .max(150),
    type: Joi.number()
        .required()
        .not(null)
        .custom(isValidUserType, "Invalid user type"),
    username: Joi.string()
        .optional()
        .max(50)
        .not(null),
    details: Joi.when("type", {
        is: 1,
        then: Joi.object({
            graduated: Joi.boolean()
                .required(),
            classCode: Joi.string()
                .allow("")
                .optional(),
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
    updateUserSchema
}
