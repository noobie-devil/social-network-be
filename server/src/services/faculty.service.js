
import * as facultyRepository from '../repositories/faculty.repo.js';
import {validateMongodbId} from "../utils/global.utils.js";
import {createFacultySchema, updateFacultySchema} from "../schemaValidate/faculty.schema.js";

export const createFaculty = async(req) => {
    await createFacultySchema.validateAsync(req.body)
    return await facultyRepository.createFaculty(req)
}

export const updateFaculty = async(req) => {
    await updateFacultySchema.validateAsync(req.body)
    const id = req.params.facultyId
    validateMongodbId(id)
    return await facultyRepository.updateFaculty(id, req.body)

}


export const deleteFaculty = async(req) => {
    const id = req.params.facultyId
    validateMongodbId(id)
    return await facultyRepository.deleteFaculty(id)
}
