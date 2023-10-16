import * as enrollmentYearRepo from "../models/repositories/enrollmentYear.repo.js";
import {
    createEnrollmentYearSchema,
    updateEnrollmentYearSchema
} from "../schemaValidate/enrollmentYear/enrollmentYear.schema.js";
import {validateMongodbId} from "../utils/validateMongodbId.js";

export const createEnrollmentYear = async(req) => {
    await createEnrollmentYearSchema.validateAsync(req.body)
    return await enrollmentYearRepo.createEnrollmentYear(req.body)
}

export const getEnrollmentYears = async(req) => {
    return await enrollmentYearRepo.getEnrollmentYears(req.body)
}

export const updateEnrollmentYear = async(req) => {
    await updateEnrollmentYearSchema.validateAsync(req.body)
    const enrollmentYearId = req.params.id
    validateMongodbId(enrollmentYearId)
    return await enrollmentYearRepo.updateEnrollmentYear(enrollmentYearId, req.body)
}

export const deleteEnrollmentYear = async(req) => {
    const enrollmentYearId = req.params.id
    validateMongodbId(enrollmentYearId)
    return await enrollmentYearRepo.deleteEnrollmentYear(enrollmentYearId)
}
