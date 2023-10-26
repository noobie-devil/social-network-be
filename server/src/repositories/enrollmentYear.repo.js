import EnrollmentYear from "../models/enrollmentYear.model.js";
import {ValidationError} from "../core/errors/validation.error.js";
import {cleanNullAndEmptyData, getUnSelectObjFromSelectArr} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";


const createEnrollmentYear = async (payload) => {
    try {
        await validateEnrollmentYear(payload)
        return await EnrollmentYear.create(payload)
    } catch (e) {
        throw e
    }
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
    try {
        const deleteResult = await EnrollmentYear.findByIdAndDelete(id)
        if(!deleteResult) {
            throw new NotFoundError()
        }
        return "Delete success"
    } catch (e) {
        throw e
    }
}

const updateEnrollmentYear = async(id, updateData) => {
    try {
        await validateEnrollmentYear(updateData)
        const updateObj = await EnrollmentYear.findByIdAndUpdate(id, updateData, { new: true})
        if(!updateObj) {
            throw new NotFoundError("Resource not found")
        }
        return updateObj
    } catch (e) {
        throw e;
    }
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
    return await EnrollmentYear.find(
        query,
    )
        .select(getUnSelectObjFromSelectArr(exclude))
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

export {
    createEnrollmentYear,
    getEnrollmentYears,
    updateEnrollmentYear,
    deleteEnrollmentYear
}
