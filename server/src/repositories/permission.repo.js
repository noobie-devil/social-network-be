import {Resource, ResourcePermission} from "../models/permission.model.js";
import mongoose from "mongoose";
import {ValidationError} from "../core/errors/validation.error.js";
import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {Admin} from "../models/admin.model.js";


const createResource = async(payload, session = null) => {
    const {resourceName} = payload
    const existedResource = await Resource.findOne({resourceName})
    if(existedResource) throw new ValidationError({
        message: `Already exists resource ${resourceName}`
    })
    let opts = {}
    if(session) {
        opts = {session}
    }
    return await Resource.create([payload], opts)
}
const getResource = async({search = "", limit = 20, page = 1}) => {
    const skip = (page - 1) * limit
    const filter = {
        resourceName: new RegExp(search, 'i')
    }
    const resources = await Resource.find(filter)
        .limit(limit)
        .skip(skip)
        .lean()
    const count = await Resource.countDocuments(filter)
    return {
        resources,
        totalCount: count
    }
}

const updateResource = async(resId, payload) => {
    payload = cleanNullAndEmptyData(payload)
    const updateResource = await Resource.findByIdAndUpdate(resId, payload, {new: true})
    if(!updateResource) {
        throw new NotFoundError()
    }
    return updateResource
}

const deleteResource = async(resId) => {
    const existingResource = await Resource.findById(resId)
    if(!existingResource) throw new NotFoundError()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await ResourcePermission.deleteMany({resource: resId}, {session})
        await Resource.deleteOne({_id: resId}, {session})
        await session.commitTransaction()
        return "Delete success"
    } catch (e) {
        await session.abortTransaction()
        throw e
    } finally {
        await session.endSession()
    }
}

const getPermissionsByAdminId = async(aid, {limit = 20, page = 1}) => {
    const existingAdmin = await Admin.findById(aid)
    if(!existingAdmin) throw new NotFoundError()
    const skip = (page - 1) * limit
    const query = {
        $or: [
            { actorType: "Admin", actor: existingAdmin._id},
            { actorType: "AdminGroup", actor: existingAdmin.group}
        ]
    }
    const permissions = await ResourcePermission.find(query)
        .populate({
            path: "resource",
            select: "resourceName"
        })
        .select("operation resource.resourceName")
        .skip(skip)
        .limit(limit)
        .lean()
    const totalCount = await ResourcePermission.countDocuments(query)
    return {
        permissions,
        totalCount
    }
}

const getResourcePermission = async({search = "", limit = 20, page = 1, actorTypeFilter = ""}) => {
    const skip = (page - 1) * limit
    let query = {}
    if(actorTypeFilter !== null && actorTypeFilter.trim() !== "") {
        query = {
            actorType: { actorType: actorTypeFilter}
        }
    }
    const resourcePermissions = await ResourcePermission.find(query)
        .populate({
            path: "resource",
            match: {resourceName: new RegExp(search, "i")},
            select: "resourceName"
        })
        .limit(limit)
        .skip(skip)
        .lean()
    const totalCount = await ResourcePermission.countDocuments(query)
    return {
        resourcePermissions,
        totalCount
    }
}

const createResourcePermission = async(payload, session = null) => {
    const {resource, actor, actorType} = payload
    const existingResourcePermission = await ResourcePermission.findOne({ resource, actor, actorType })
    if(existingResourcePermission) throw new ValidationError({
        message: "Already exists this resource permission",
        statusCode: 409
    })
    let opts = {}
    if(session) {
        opts = {session}
    }
    return await ResourcePermission.create([payload], opts)
}

// Only allow to update operations number in resource permission for actor (admin, adminGroup)
const updatePermissionForActor = async(permissionId, payload) => {
    payload = cleanNullAndEmptyData(payload)
    const updated = await ResourcePermission.findByIdAndUpdate(permissionId, payload, {new: true})
    if(!updated) {
        throw new NotFoundError()
    }
    return updated
}

const deletePermission = async(id) => {
    const deleteResult = await ResourcePermission.findByIdAndDelete(id)
    if(!deleteResult) {
        throw new NotFoundError()
    }
    return "Delete success"
}

const createNewPermission = async({resourceName, othersPermission = 4, actor, actorType, operation}, userId) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const existedResource = await Resource.findOne({resourceName})
        if(existedResource) throw new ValidationError({
            message: `Already exists resource ${resourceName}`
        })
        const resource = new Resource({
            resourceName,
            othersPermission,
            updatedBy: userId,
            createdBy: userId
        })
        const resourcePermission = new ResourcePermission({
            resource: resource._id,
            actor,
            actorType,
            operation,
            updatedBy: userId,
            createdBy: userId
        })
        resource.permissions.addToSet(resourcePermission._id)
        await resource.save({session})
        await resourcePermission.save({session})
        await session.commitTransaction()
        return resource
    } catch (e) {
        await session.abortTransaction()
        throw e
    } finally {
        await session.endSession()
    }
}

const findPermissionByResourceName = async (resourceName) => {
    return await Resource.findOne({resourceName}).exec()
}

const checkAdminHasPermission = async(aid, gid, resId) => {
    const filter = {
        $or: []
    }
    if(aid) {
        filter.$or.push({ $and: [{actor: aid, actorType: 'Admin'}, { resource: resId}] })
    }
    if(gid) {
        filter.$or.push({ $and: [{ actor: gid, actorType: 'AdminGroup' }, { resource: resId }] })
    }
    return await ResourcePermission.findOne(filter).exec()
}

export {
    createResource,
    getResource,
    updateResource,
    deleteResource,
    getResourcePermission,
    createResourcePermission,
    updatePermissionForActor,
    deletePermission,
    getPermissionsByAdminId,
    findPermissionByResourceName,
    checkAdminHasPermission,
}
