import Faculty from "../faculty.model.js";
import {ValidationError} from "../../core/errors/validation.error.js";
import {NotFoundError} from "../../core/errors/notFound.error.js";
import {cleanNullAndEmptyData} from "../../utils/lodash.utils.js";

const createFaculty = async(req) => {
    try {
        const exists = await Faculty.findOne(req.body)
        if(exists) throw new ValidationError({
            message: 'Already exists faculty',
            statusCode: 409
        })

        return await Faculty.create(req.body)
    } catch (e) {
        throw e
    }
}

const updateFaculty = async(facultyId, updateData) => {
    try {
        // updateData = cleanData(updateData)
        updateData = cleanNullAndEmptyData(updateData)
        const updatedFaculty = await Faculty.findByIdAndUpdate(facultyId, updateData, { new: true})
        if(!updatedFaculty) {
            throw new NotFoundError("Resource not found")
        }
        return updatedFaculty
    } catch (e) {
        throw e
    }
}

const deleteFaculty = async(facultyId) => {
    try {
        const faculty = await Faculty.findById(facultyId)
        if(!faculty) throw new NotFoundError("Resource not found")
        if(faculty.majors.length > 0) {
            throw new ValidationError({
                message: "Cannot delete! There is an existing reference to this record"
            })
        }
        await faculty.deleteOne()
        return "Delete success"
    } catch (e) {
        throw e
    }
}


export {
    createFaculty,
    updateFaculty,
    deleteFaculty
}
