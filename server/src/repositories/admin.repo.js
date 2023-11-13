import {Admin, AdminGroup} from "../models/admin.model.js";
import {ValidationError} from "../core/errors/validation.error.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";


const createAdmin = async(payload) => {
    const {email} = payload
    const existingAdmin = await Admin.findOne({email})
    if(existingAdmin) throw new ValidationError({
        message: 'Already exists this email',
        statusCode: 409
    })
    return await Admin.create(payload).exec()
}


const addToGroup = async({aid, gid}) => {
    return await updateGroupForAdmin({aid, gid}, true)
}

const removeFromGroup = async({aid, gid}) => {
    return await updateGroupForAdmin({aid, gid}, false)
}

const updateGroupForAdmin = async({aid, gid}, shouldRemove) => {
    const existingAdmin = await Admin.findById(aid)
    if(!existingAdmin) throw new NotFoundError("Not found admin")
    const existingGroup = await AdminGroup.findById(gid)
    if(!existingGroup) throw new NotFoundError("Not found group")
    if(!shouldRemove && existingAdmin.group === gid) {
        throw new BadRequestError()
    } else if (shouldRemove && existingAdmin.group !== gid) {
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
            await existingGroup.save({session})
            await existingAdmin.save({session})
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

const createAdminGroup = async(payload) => {
    const {groupName} = payload
    const existingGroup = await AdminGroup.findOne({groupName})
    if(existingGroup) throw new ValidationError({
        message: 'Already exists this group name',
        statusCode: 409
    })
    return await AdminGroup.create(payload).exec()
}

export {
    createAdmin,
    createAdminGroup,
    addToGroup,
    removeFromGroup
}
