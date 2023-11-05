import Faculty from "../models/faculty.model.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import Major from "../models/major.model.js";
import {ValidationError} from "../core/errors/validation.error.js";
import mongoose, {startSession} from "mongoose";
import {cleanNullAndEmptyArray} from "../utils/lodash.utils.js";



const formatDataRecursively = (input, parentKey = '') => {
    const formattedData = {};
    for (let key in input) {
        if (typeof input[key] === 'object') {
            const nestedData = formatDataRecursively(input[key], `${parentKey}${key}.`);
            Object.assign(formattedData, nestedData);
        } else {
            formattedData[`${parentKey}${key}`] = input[key];
        }
    }
    return formattedData;
};

const updateMajor = async (majorId, updateData) => {
    const session = await startSession()
    session.startTransaction()
    try {
        updateData = cleanNullAndEmptyArray(updateData)
        updateData = formatDataRecursively(updateData)
        const updateMajor = await Major.findByIdAndUpdate(majorId, updateData, {new: true, }).session(session)
        // const updateMajor = await Major.findOneAndUpdate({_id: majorId}, updateData, {new: true, runValidators: true, context: 'query'})
        if (!updateMajor) {
            throw new NotFoundError("Resource not found")
        }
        const error = updateMajor.validateSync()

        if(error && error.errors && error.errors['name'].message) {
            throw new ValidationError({
                message: error.errors['name'].message,
                statusCode: 409
            })
        }
        await session.commitTransaction()
        return updateMajor
    } catch (e) {
        await session.abortTransaction()
        throw e;
    } finally {
        await session.endSession()
    }
}

const deleteMajor = async (majorId) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const major = await Major.findById(majorId);
        if (!major) throw new NotFoundError("Not found resource");
        if (major.faculty) {
            await Faculty.findByIdAndUpdate(
                major.faculty,
                {$pull: {majors: majorId}},
                {session}
            )
        }
        await Major.findByIdAndDelete(majorId).session(session)
        await session.commitTransaction()
        return "Delete success"
    } catch (e) {
        await session.abortTransaction()
        throw e
    } finally {
        await session.endSession()
    }
}

const getMajor = async({search = "", limit = 20, page = 1, lang = "vi"}) => {
    const skip = (page - 1) * limit
    const filter = {
        $or: [{ code: new RegExp(search, 'i') }, { [`name.${lang}`]: new RegExp(search, 'i')}]
    }
    const majors = await Major.find(filter)
        .limit(limit)
        .skip(skip)
        .lean()
    const count = await Major.countDocuments(filter)
    return {
        majors,
        totalCount: count
    }
}

const createMajor = async ({code, name, facultyId}) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const existsFaculty = await Faculty.findById(facultyId)
        if (!existsFaculty) throw new NotFoundError("Invalid faculty id")
        const existsMajor = await Major.findOne({code, faculty: facultyId})
        if (existsMajor) throw new ValidationError({
            message: "Already exists major",
            statusCode: 409
        })
        const newMajor = await Major.create([{code, name, faculty: facultyId}], {session: session})
        await Faculty.findByIdAndUpdate(
            facultyId,
            {$push: {majors: newMajor[0]._id}},
            {upsert: true, session}
        )
        await session.commitTransaction()
        return newMajor
    } catch (e) {
        await session.abortTransaction()
        if(e.errors && e.errors['name'].message) {
            throw new ValidationError({
                message: e.errors['name'].message,
                statusCode: 409
            })
        } else {
            throw e;
        }
    } finally {
        await session.endSession();
    }
}


export {
    createMajor,
    updateMajor,
    deleteMajor,
    getMajor
}
