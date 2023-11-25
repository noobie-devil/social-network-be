import {createMajorSchema, queryMajorSchema, updateMajorSchema} from "../schemaValidate/major.schema.js";
import * as majorRepository from '../repositories/major.repo.js';
import {validateMongodbId} from "../utils/global.utils.js";

export const createMajor = async(req) => {
    await createMajorSchema.validateAsync(req.body)
    return await majorRepository.createMajor(req.body)
}

export const updateMajor = async(req) => {
    await updateMajorSchema.validateAsync(req.body)
    const id = req.params.majorId
    validateMongodbId(id)
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
