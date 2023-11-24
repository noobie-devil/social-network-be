import * as permissionRepo from '../repositories/permission.repo.js'
import {createResourceSchema} from "../schemaValidate/permission.schema.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";


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

export {
    findPermissionByResourceName,
    checkAdminHasPermission,
    createResource
}
