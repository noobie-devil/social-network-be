import {Resource, ResourcePermission} from "../models/permission.model.js";
import mongoose from "mongoose";
import {ValidationError} from "../core/errors/validation.error.js";
import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {Admin, AdminGroup} from "../models/admin.model.js";


const createResource = async (payload, session = null) => {
    const {resourceName} = payload
    const existedResource = await Resource.findOne({resourceName})
    if (existedResource) throw new ValidationError({
        message: `Already exists resource ${resourceName}`
    })
    let opts = {}
    if (session) {
        opts = {session}
    }
    return await new Resource(payload, opts)
        .save()
        // return await Resource.create([payload], opts)
        .then(value => value.populate([{path: 'createdBy', select: 'username -_id'}, {
            path: 'updatedBy',
            select: 'username -_id'
        }]))

}
const getResource = async ({search = "", limit = 20, page = 1}) => {
    const skip = (page - 1) * limit
    const filter = {
        resourceName: new RegExp(search, 'i')
    }
    const resources = await Resource.find(filter)
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
    const count = await Resource.countDocuments(filter)
    return {
        resources,
        totalCount: count
    }
}

const updateResource = async (resId, payload) => {
    payload = cleanNullAndEmptyData(payload)
    const updateResource = await Resource.findByIdAndUpdate(resId, payload, {new: true})
        .populate({
            path: 'createdBy',
            select: 'username -_id'
        })
        .populate({
            path: 'updatedBy',
            select: 'username -_id'
        })
    if (!updateResource) {
        throw new NotFoundError()
    }
    return updateResource
}

const deleteResource = async (resId) => {
    const existingResource = await Resource.findById(resId)
    if (!existingResource) throw new NotFoundError()
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

const getPermissionsByAdminId = async (aid, {limit = 20, page = 1}) => {
    const existingAdmin = await Admin.findById(aid)
    if (!existingAdmin) throw new NotFoundError()
    const skip = (page - 1) * limit
    const query = {
        $or: [
            {actorType: "Admin", actor: existingAdmin._id},
            {actorType: "AdminGroup", actor: existingAdmin.group}
        ]
    }
    const permissions = await ResourcePermission.find(query)
        .populate([{
            path: "resource",
            select: "resourceName othersPermission"
        }, {
            path: "updatedBy",
            select: "username -_id"
        }, {
            path: "createdBy",
            select: "username -_id"
        }])
        .select("_id operation resource")
        .skip(skip)
        .limit(limit)
        .lean()
    const totalCount = await ResourcePermission.countDocuments(query)
    return {
        permissions,
        totalCount
    }
}

const getResourcePermission = async ({ search = "", limit = 20, page = 1, actorTypeFilter = "", resourceId = '' }) => {
    const skip = (page - 1) * limit
    let query = {
    }
    if (actorTypeFilter !== null && actorTypeFilter.trim() !== "") {
        query = {
            actorType: actorTypeFilter
        }
    }
    query.resource = resourceId
    const resourcePermissions = await ResourcePermission.find(query)
        .populate([{
            path: "resource",
            match: { resourceName: new RegExp(search, "i") },
            select: "resourceName othersPermission"
        }, {
            path: "updatedBy",
            select: "username -_id"
        }, {
            path: "createdBy",
            select: "username -_id"
        }])
        .limit(limit)
        .skip(skip)
        .lean()
    const totalCount = await ResourcePermission.countDocuments(query)
    const adminIds = []
    const adminGroupIds = []

    resourcePermissions
        .forEach(permission => {
            if (permission.actorType === "Admin") {
                adminIds.push(permission.actor)
            } else {
                adminGroupIds.push(permission.actor)
            }
        })

    const [admins, adminGroups] = await Promise.all([
        Admin.find({
            _id: { $in: adminIds }
        }).select("username").lean(),
        AdminGroup.find({
            _id: { $in: adminGroupIds }
        }).select("groupName").lean()
    ])

    const adminMap = new Map(admins.map(admin => [admin._id.toString(), admin]))
    const adminGroupMap = new Map(adminGroups.map(group => [group._id.toString(), group]))

    const populatedResourcePermissions = resourcePermissions.map(permission => {
        if (permission.actorType === "Admin" && permission.actor) {
            return { ...permission, actor: adminMap.get(permission.actor.toString()) }
        } else if (permission.actorType === "AdminGroup" && permission.actor) {
            return { ...permission, actor: adminGroupMap.get(permission.actor.toString()) }
        }
        return permission
    })

    return {
        resourcePermissions: populatedResourcePermissions,
        totalCount
    }
}

const createResourcePermission = async (payload, session = null) => {
    const {resource, actor, actorType} = payload
    let actorObject = {}
    if (actorType === "Admin") {
        actorObject = await Admin.findById(actor)
            .select("username")
        if (!actorObject) throw new NotFoundError()
    } else {
        const actorObject = await AdminGroup.findById(actor)
            .select("groupName")
        if (!actorObject) throw new NotFoundError()
    }
    const existingResourcePermission = await ResourcePermission.findOne({resource, actor, actorType})
    if (existingResourcePermission) throw new ValidationError({
        message: "Already exists this resource permission",
        statusCode: 409
    })
    let opts = {}
    if (session) {
        opts = {session}
    }

    return await new ResourcePermission(payload)
        .save(opts)
        .then(async value => {
            await value.populate([
                {path: "resource", select: "resourceName othersPermission"},
                {path: "updatedBy", select: "username -_id"},
                {path: "updatedBy", select: "username -_id"},
            ])
            const valueObject = value.toObject()
            valueObject.actor = actorObject
            return valueObject
        })

}

// Only allow to update operations number in resource permission for actor (admin, adminGroup)
const updatePermissionForActor = async (permissionId, payload) => {
    payload = cleanNullAndEmptyData(payload)
    const updated = await ResourcePermission.findByIdAndUpdate(permissionId, payload, {new: true})
        .populate([{
            path: "updatedBy",
            select: "username -_id"
        }, {
            path: "createdBy",
            select: "username -_id"
        }])
        .lean()

    if (!updated) {
        throw new NotFoundError()
    } else {
        let actorObject = {}
        if(updated.actorType === "Admin") {
            actorObject = await Admin.findById(updated.actor)
                .select("username")

        } else if(updated.actorType === "AdminGroup") {
            actorObject = await AdminGroup.findById(updated.actor)
                .select("groupName")
        }
        updated.actor = actorObject
    }
    return updated
}

const deletePermission = async (id) => {
    const deleteResult = await ResourcePermission.findByIdAndDelete(id)
    if (!deleteResult) {
        throw new NotFoundError()
    }
    return "Delete success"
}

const createNewPermission = async ({resourceName, othersPermission = 4, actor, actorType, operation}, userId) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const existedResource = await Resource.findOne({resourceName})
        if (existedResource) throw new ValidationError({
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
    return await Resource.findOne({resourceName})
        .populate([{
            path: "updatedBy",
            select: "username -_id"
        }, {
            path: "createdBy",
            select: "username -_id"
        }]).exec()
}

const checkAdminHasPermission = async (aid, gid, resId) => {
    const filter = {
        $or: []
    }
    if (aid) {
        filter.$or.push({$and: [{actor: aid, actorType: 'Admin'}, {resource: resId}]})
    }
    if (gid) {
        filter.$or.push({$and: [{actor: gid, actorType: 'AdminGroup'}, {resource: resId}]})
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
