import Faculty from "../models/faculty.model.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import Major from "../models/major.model.js";
import {ValidationError} from "../core/errors/validation.error.js";
import mongoose from "mongoose";
import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";


const updateMajor = async (majorId, updateData) => {
    try {
        updateData = cleanNullAndEmptyData(updateData)
        const { ...rest } = updateData
        const queryObj = {}
        for(const key in rest) {
            if(Array.isArray(rest[key])) {
                queryObj.$addToSet = { [key]: {$each: rest[key]} }
            } else {
                queryObj[key] = rest[key]
            }
        }
        const updateMajor = await Major.findByIdAndUpdate(majorId, queryObj, {new: true})
        if (!updateMajor) {
            throw new NotFoundError("Resource not found")
        }
        return updateMajor
    } catch (e) {
        throw e;
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

const createMajor = async ({code, name, facultyId}) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const existsFaculty = await Faculty.findById(facultyId)
        if (!existsFaculty) throw new NotFoundError("Invalid faculty id")
        const existsMajor = await Major.findOne({code, name, faculty: facultyId})
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
        await session.endSession()
        return newMajor

    } catch (e) {
        await session.abortTransaction()
        await session.endSession();
        if(e.errors['name'].message) {
            throw new ValidationError({
                message: e.errors['name'].message,
                statusCode: 409
            })
        } else {
            throw e;
        }
    }
}


export {
    createMajor,
    updateMajor,
    deleteMajor
}
