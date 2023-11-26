import Faculty from "../models/faculty.model.js";
import {ValidationError} from "../core/errors/validation.error.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import Major from "../models/major.model.js";

const createFaculty = async(payload) => {
    try {
        const exists = await Faculty.findOne(payload)
        if(exists) throw new ValidationError({
            message: 'Already exists faculty',
            statusCode: 409
        })
        return await new Faculty(payload)
            .save()
            .then(value => value.populate([
                {path: "updatedBy", select: "username -_id"},
                {path: "createdBy", select: "username -_id"}
            ]))
        // return await Faculty.create(payload)
    } catch (e) {
        throw e
    }
}

const getFaculty = async({search = "", limit = 20, page = 1}) => {
    const skip = (page - 1) * limit
    const filter = {
        $or: [
            { code: { $regex: search, $options: "i"} },
            { name: { $regex: search, $options: "i"} }
        ]
    }
    const faculties = await Faculty.find(filter)
        .populate([{
            path: "updatedBy",
            select: "username -_id"
        },{
            path: "createdBy",
            select: "username -_id"
        }])
        .limit(limit)
        .skip(skip)
        .lean()
    const count = await Faculty.countDocuments(filter)
    return {
        faculties,
        totalCount: count
    }

}

const updateFaculty = async(facultyId, updateData) => {
    updateData = cleanNullAndEmptyData(updateData)
    const updatedFaculty = await Faculty.findByIdAndUpdate(facultyId, updateData, { new: true})
        .populate([{
            path: "updatedBy",
            select: "username -_id"
        },{
            path: "createdBy",
            select: "username -_id"
        }])
    if(!updatedFaculty) {
        throw new NotFoundError()
    }
    return updatedFaculty
}

const deleteFaculty = async(facultyId) => {
    const faculty = await Faculty.findById(facultyId)
    if(!faculty) throw new NotFoundError()
    const existingRef = await Major.findOne({faculty: faculty._id})
    if(existingRef) {
        throw new ValidationError({
            message: "Cannot delete! There is an existing reference to this record"
        })
    }
    await faculty.deleteOne()
    return "Delete success"
}


export {
    getFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty
}
