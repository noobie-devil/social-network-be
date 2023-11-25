import * as permissionRepo from '../repositories/permission.repo.js'
import {
    createResourcePermissionSchema,
    createResourceSchema,
    getPermissionsByAdminIdSchema, getResourcePermissionSchema, updateResourcePermissionSchema,
    updateResourceSchema
} from "../schemaValidate/permission.schema.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {baseQuerySchema} from "../schemaValidate/query.schema.js";
import {validateMongodbId} from "../utils/global.utils.js";


const findPermissionByResourceName = async(resourceName) => {
    return await permissionRepo.findPermissionByResourceName(resourceName)
}

const checkAdminHasPermission = async(aid, gid, resId) => {
    return await permissionRepo.checkAdminHasPermission(aid, gid, resId)
}

const createResource = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await createResourceSchema.validateAsync(req.body)
    req.body.updatedBy = req.user._id
    req.body.createdBy = req.user._id
    return await permissionRepo.createResource(req.body)

}

const getResource = async(req) => {
    await baseQuerySchema.validateAsync(req.query)
    return permissionRepo.getResource(req.query)
}

const updateResource = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const resourceId = req.params.resourceId
    validateMongodbId(resourceId)
    await updateResourceSchema.validateAsync(req.body)
    req.body.updatedBy = req.user._id
    return await permissionRepo.updateResource(resourceId, req.body)
}

const deleteResource = async(req) => {
    const resourceId = req.params.resourceId
    validateMongodbId(resourceId)
    return await permissionRepo.deleteResource(resourceId)
}

const getPermissionsByAdminId = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await getPermissionsByAdminIdSchema.validateAsync(req.query)
    return await permissionRepo.getPermissionsByAdminId(req.user._id, req.query)
}

const getResourcePermission = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await getResourcePermissionSchema.validateAsync(req.query)
    return await permissionRepo.getResourcePermission(req.query)
}

const createResourcePermission = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await createResourcePermissionSchema.validateAsync(req.body)
    return await permissionRepo.createResourcePermission(req.body)
}

const updatePermissionForActor = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const resourcePermissionId = req.params.resourcePermissionId
    validateMongodbId(resourcePermissionId)
    await updateResourcePermissionSchema.validateAsync(req.body)
    req.body.updatedBy = req.user._id
    return await permissionRepo.updatePermissionForActor(resourcePermissionId, req.body)
}

const deletePermission = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const resourcePermissionId = req.params.resourcePermissionId
    validateMongodbId(resourcePermissionId)
    return await permissionRepo.deletePermission(resourcePermissionId)
}

export {
    findPermissionByResourceName,
    checkAdminHasPermission,
    createResource,
    getResource,
    updateResource,
    deleteResource,
    getPermissionsByAdminId,
    getResourcePermission,
    createResourcePermission,
    updatePermissionForActor,
    deletePermission
}
