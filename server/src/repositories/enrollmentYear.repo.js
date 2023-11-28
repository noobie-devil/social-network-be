import EnrollmentYear from "../models/enrollmentYear.model.js";
import {ValidationError} from "../core/errors/validation.error.js";
import {cleanNullAndEmptyData, getUnSelectObjFromSelectArr} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";


const createEnrollmentYear = async (payload) => {
    await validateEnrollmentYear(payload)
    return await new EnrollmentYear(payload)
        .save()
        .then(value => value.populate([
            { path: "createdBy", select: "username -_id"},
            { path: "updatedBy", select: "username -_id"}
        ]))
}

const validateEnrollmentYear = async(data) => {
    data = cleanNullAndEmptyData(data)
    const arr = Object.entries(data).map(entry => {
        return { [entry[0]]: entry[1] };
    })
    const existingEnrollmentYear = await EnrollmentYear.findOne({
        $or: arr
    })
    if(existingEnrollmentYear) throw new ValidationError({
        message: "Enrollment year with same name or start year already exists"
    })

}

const deleteEnrollmentYear = async(id) => {
    const deleteResult = await EnrollmentYear.findByIdAndDelete(id)
    if(!deleteResult) {
        throw new NotFoundError()
    }
    return "Delete success"
}

const updateEnrollmentYear = async(id, updateData) => {
    await validateEnrollmentYear(updateData)
    const updateObj = await EnrollmentYear.findByIdAndUpdate(id, updateData, { new: true})
        .populate([
            { path: "createdBy", select: "username -_id"},
            { path: "updatedBy", select: "username -_id"}
        ])
    if(!updateObj) {
        throw new NotFoundError()
    }
    return updateObj
}

const getEnrollmentYears = async ({search = "", limit = 20, page = 1}) => {
    const skip = (page - 1) * limit
    const exclude = ["__v", "score"]
    let query = {}
    let sortCondition = {}
    if(search.trim() !== '') {
        query = {
            $text: {$search: search}
        }
        sortCondition = { score: {$meta: 'textScore'}}
    }
    const enrollmentYears = await EnrollmentYear.find(
        query,
    )
        .populate([
            { path: "createdBy", select: "username -_id"},
            { path: "updatedBy", select: "username -_id"}
        ])
        .select(getUnSelectObjFromSelectArr(exclude))
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
    const totalCount = await EnrollmentYear.countDocuments(query)
    return {
        enrollmentYears,
        totalCount
    }
}

export {
    createEnrollmentYear,
    getEnrollmentYears,
    updateEnrollmentYear,
    deleteEnrollmentYear
}
