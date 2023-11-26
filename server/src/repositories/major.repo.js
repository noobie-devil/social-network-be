import Faculty from "../models/faculty.model.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import Major from "../models/major.model.js";
import {ValidationError} from "../core/errors/validation.error.js";
import mongoose from "mongoose";
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
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        updateData = cleanNullAndEmptyArray(updateData)
        updateData = formatDataRecursively(updateData)
        const updateMajor = await Major.findByIdAndUpdate(majorId, updateData, {new: true, })
            .populate({path: 'faculty', select: "code name"})
            .populate([{
                path: "updatedBy",
                select: "username -_id"
            },{
                path: "createdBy",
                select: "username -_id"
            }])
            .session(session)
        // const updateMajor = await Major.findOneAndUpdate({_id: majorId}, updateData, {new: true, runValidators: true, context: 'query'})
        if (!updateMajor) {
            throw new NotFoundError()
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
    const major = await Major.findById(majorId);
    if (!major) throw new NotFoundError();
    await Major.findByIdAndDelete(majorId)
    return "Delete success"
}

const getMajor = async({search = "", limit = 20, page = 1, lang = "vi"}) => {
    const skip = (page - 1) * limit
    const filter = {
        $or: [{ code: new RegExp(search, 'i') }, { [`name.${lang}`]: new RegExp(search, 'i')}]
    }
    const majors = await Major.find(filter)
        .populate({path: 'faculty', select: "code name"})
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
    const count = await Major.countDocuments(filter)
    return {
        majors,
        totalCount: count
    }
}

const createMajor = async ({code, name, facultyId, updateBy, createdBy}) => {

    try {
        const existsFaculty = await Faculty.findById(facultyId)
        if (!existsFaculty) throw new NotFoundError("Invalid faculty id")
        const existsMajor = await Major.findOne({code, faculty: facultyId})
        if (existsMajor) throw new ValidationError({
            message: "Already exists major",
            statusCode: 409
        })
        return await new Major({code, name, faculty: facultyId, updateBy, createdBy})
            .save()
            .then(value => value.populate([
                {path: 'faculty', select: "code name"},
                {path: "updatedBy", select: "username -_id"},
                {path: "createdBy", select: "username -_id"}
            ]))
        // return await Major.create({code, name, faculty: facultyId})
        // await Faculty.findByIdAndUpdate(
        //     facultyId,
        //     {$push: {majors: newMajor[0]._id}},
        //     {upsert: true, session}
        // )
    } catch (e) {
        if(e.errors && e.errors['name'].message) {
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
    deleteMajor,
    getMajor
}
