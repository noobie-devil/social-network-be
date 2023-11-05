import {Resource, ResourcePermission} from "../models/permission.model.js";
import mongoose from "mongoose";
import {ValidationError} from "../core/errors/validation.error.js";

class ResourceDTO {
    constructor({
        resourceName,
        othersPermission,
        permissions,
        createdBy,
        updatedBy
                }) {
        this.resourceName = resourceName
        this.othersPermission = othersPermission
        this.permissions = permissions
        this.createdBy = createdBy
        this.updatedBy = updatedBy
    }
}


class ResourcePermissionDTO {
    constructor({
        resource,
        actor,
        actorType,
        operation,
        createdBy,
        updatedBy
                }) {
        this.resource = resource
        this.actor = actor
        this.actorType = actorType
        this.operation = operation
        this.createdBy = createdBy
        this.updatedBy = updatedBy
    }
}


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

const createResourcePermission = async(payload, session = null) => {
    let opts = {}
    if(session) {
        opts = {session}
    }
    return await ResourcePermission.create([payload], opts)
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

