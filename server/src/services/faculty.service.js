
import * as facultyRepository from '../repositories/faculty.repo.js';
import {validateMongodbId} from "../utils/global.utils.js";
import {createFacultySchema, updateFacultySchema} from "../schemaValidate/faculty.schema.js";
import {baseQuerySchema} from "../schemaValidate/query.schema.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";

const createFaculty = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await createFacultySchema.validateAsync(req.body)
    req.body.updatedBy = req.user._id
    req.body.createdBy = req.user._id
    return await facultyRepository.createFaculty(req.body)
}

const updateFaculty = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await updateFacultySchema.validateAsync(req.body)
    const id = req.params.facultyId
    validateMongodbId(id)
    req.body.updatedBy = req.user._id
    return await facultyRepository.updateFaculty(id, req.body)

}

const getFaculty = async(req) => {
    await baseQuerySchema.validateAsync(req.query)
    return await facultyRepository.getFaculty(req.query)
}

const deleteFaculty = async(req) => {
    const id = req.params.facultyId
    validateMongodbId(id)
    return await facultyRepository.deleteFaculty(id)
}

export {
    getFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty
}
