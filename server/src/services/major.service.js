import {createMajorSchema, queryMajorSchema, updateMajorSchema} from "../schemaValidate/major.schema.js";
import * as majorRepository from '../repositories/major.repo.js';
import {validateMongodbId} from "../utils/global.utils.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";

export const createMajor = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await createMajorSchema.validateAsync(req.body)
    req.body.updatedBy = req.user._id
    req.body.createdBy = req.user._id

    return await majorRepository.createMajor(req.body)
}

export const updateMajor = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await updateMajorSchema.validateAsync(req.body)
    const id = req.params.majorId
    validateMongodbId(id)
    req.body.updatedBy = req.user._id
    return await majorRepository.updateMajor(id, req.body)
}

export const deleteMajor = async(req) => {
    const id = req.params.majorId
    validateMongodbId(id)
    return await majorRepository.deleteMajor(id)
}

export const getMajor = async(req) => {
    await queryMajorSchema.validateAsync(req.query)
    return await majorRepository.getMajor(req.query)
}
