import * as enrollmentYearRepo from "../repositories/enrollmentYear.repo.js";
import {
    createEnrollmentYearSchema,
    updateEnrollmentYearSchema
} from "../schemaValidate/enrollmentYear.schema.js";
import {validateMongodbId} from "../utils/global.utils.js";
import {baseQuerySchema} from "../schemaValidate/query.schema.js";

export const createEnrollmentYear = async(req) => {
    await createEnrollmentYearSchema.validateAsync(req.body)
    return await enrollmentYearRepo.createEnrollmentYear(req.body)
}

export const getEnrollmentYears = async(req) => {
    await baseQuerySchema.validateAsync(req.query)
    return await enrollmentYearRepo.getEnrollmentYears(req.query)
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
