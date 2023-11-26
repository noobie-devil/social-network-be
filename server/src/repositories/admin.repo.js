import {Admin, AdminGroup} from "../models/admin.model.js";
import {ValidationError} from "../core/errors/validation.error.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {unSelectUserFieldToPublic} from "../utils/global.utils.js";


const findAdminByEmail = async(email) => {
    return await Admin.findOne({email})
        .populate({
            path: 'createdBy',
            select: 'username -_id'
        })
        .populate({
            path: 'updatedBy',
            select: 'username -_id'
        })
        // .select(unSelectUserFieldToPublic({ timestamps: true}))
        .exec()
}
const getAdmin = async({search = "", limit = 20, page = 1}) => {
    const skip = (page - 1) * limit
    const filter = {
        $or: [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }]
    }
    const admins = await Admin.find(filter)
        .populate({
            path: 'createdBy',
            select: 'username -_id'
        })
        .populate({
            path: 'updatedBy',
            select: 'username -_id'
        })
        .limit(limit)
        .skip(skip)
        .lean()
    const count = await Admin.countDocuments(filter)
    return {
        admins,
        totalCount: count
    }
}

const getAdminGroup = async({search = "", limit = 20, page = 1}) => {
    const skip = (page - 1) * limit
    const filter = {
        groupName: new RegExp(search, 'i')
    }
    const groups = await AdminGroup.find(filter)
        .populate({
            path: 'createdBy',
            select: 'username -_id'
        })
        .populate({
            path: 'updatedBy',
            select: 'username -_id'
        })
        .limit(limit)
        .skip(skip)
        .lean()
    const count = await AdminGroup.countDocuments(filter)
    return {
        groups,
        totalCount: count
    }
}

const createAdmin = async(payload) => {
    try {
        const {email} = payload
        const existingAdmin = await Admin.findOne({email})
        if(existingAdmin) throw new ValidationError({
            message: 'Already exists this email',
            statusCode: 409
        })
        return await new Admin(payload)
            .save()
            .then(value => value.populate([{path: 'createdBy', select: 'username -_id'}, { path: 'updatedBy', select: 'username -_id'}]))
        // return await Admin.create(payload)
    } catch (e) {
        throw e
    }

}

const changePassword = async({currentPassword, newPassword}, aid) => {
    let adminToUpdate = await getById(aid)
    const match = await adminToUpdate.comparedPassword(currentPassword)
    if(!match) throw new InvalidCredentialsError()
    adminToUpdate.password = newPassword
    await adminToUpdate.save()
    return "Change password success"

}

const getById = async(aid) => {
    let foundAdmin = await Admin.findById(aid)
    if(!foundAdmin) throw new NotFoundError("Not found admin")
    return foundAdmin
}

const changeUsername = async({username}, aid) => {
    let adminToUpdate = await getById(aid)
    const existingUsername = await Admin.findOne({username})
    if(existingUsername) throw new ValidationError({
        message: "Already exists username",
        statusCode: 409
    })
    adminToUpdate.username = username
    await adminToUpdate.save()
    return adminToUpdate
}

const deleteAdmin = async(aid) => {
    const adminToDelete = await getById(aid)
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const {group} = adminToDelete
        if(group) {
            await AdminGroup.updateOne({ _id: group}, { $pull: { admins: aid }}, {session})
        }
        await Admin.deleteOne({_id: aid}, { session })
        await session.commitTransaction()
        return "Delete success"
    } catch (e) {
        await session.abortTransaction()
        throw e
    } finally {
        await session.endSession()
    }
}


const createAdminGroup = async(payload) => {
    try {
        const {groupName} = payload
        const existingGroup = await AdminGroup.findOne({groupName})
        if(existingGroup) throw new ValidationError({
            message: 'Already exists this group name',
            statusCode: 409
        })
        return await new AdminGroup(payload)
            .save()
            .then(value => value.populate([{path: 'createdBy', select: 'username -_id'}, { path: 'updatedBy', select: 'username -_id'}]))
    } catch (e) {
        throw e
    }

}

const updateAdminGroup = async(gid, updateData) => {
    try {
        updateData = cleanNullAndEmptyData(updateData)
        const updatedAdminGroup = await AdminGroup.findByIdAndUpdate(gid, updateData, {new: true})
            .populate({
                path: 'createdBy',
                select: 'username -_id'
            })
            .populate({
                path: 'updatedBy',
                select: 'username -_id'
            })
        if(!updatedAdminGroup) {
            throw new NotFoundError()
        }
        return updatedAdminGroup
    } catch (e) {
        throw e
    }
}
const deleteAdminGroup = async(gid) => {
    const existingGroup = await AdminGroup.findById(gid)
    if(!existingGroup) throw new NotFoundError("Not found admin group")
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const bulkOps = [{
            updateMany: {
                filter: { group: gid },
                update: { $pull: { group: gid }}
            }
        }]
        await Admin.bulkWrite(bulkOps, {session})
        await AdminGroup.deleteOne({_id: gid}, {session})
        await session.commitTransaction()
        return "Delete success"
    } catch (e) {
        await session.abortTransaction()
        throw e
    } finally {
        await session.endSession()
    }
}

const updateGroupForAdmin = async({aid, gid, updatedBy}, shouldRemove) => {
    let existingAdmin = await Admin.findById(aid)
    if(!existingAdmin) throw new NotFoundError("Not found admin")
    const existingGroup = await AdminGroup.findById(gid)
    if(!existingGroup) throw new NotFoundError("Not found group")
    if(!shouldRemove && existingAdmin.group.toString() === gid) {
        throw new BadRequestError()
    } else if (shouldRemove && existingAdmin.group && existingAdmin.group.toString() !== gid) {
        throw new BadRequestError()
    } else {
        const session = await mongoose.startSession()
        session.startTransaction()
        try {
            if(shouldRemove) {
                existingGroup.admins.pull(aid)
                existingAdmin.group = undefined
            } else {
                existingGroup.admins.push(aid)
                existingAdmin.group = gid
            }
            existingGroup.updatedBy = updatedBy
            await existingGroup.save({session})
            existingAdmin = await existingAdmin.save({session})
                .then(value => value.populate([{path: 'createdBy', select: 'username -_id'}, { path: 'updatedBy', select: 'username -_id'}]))
            await session.commitTransaction()
            return existingAdmin
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
        }
    }
}

const addToGroup = async({aid, gid, updatedBy}) => {
    return await updateGroupForAdmin({aid, gid, updatedBy}, false)
}

const removeFromGroup = async({aid, gid, updatedBy}) => {
    return await updateGroupForAdmin({aid, gid, updatedBy}, true)
}

export {
    getAdmin,
    createAdmin,
    changePassword,
    changeUsername,
    deleteAdmin,
    findAdminByEmail,
    getAdminGroup,
    createAdminGroup,
    updateAdminGroup,
    deleteAdminGroup,
    addToGroup,
    removeFromGroup,
}
