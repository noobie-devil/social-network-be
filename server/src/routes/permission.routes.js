import express from "express";
import {
    createResource, deletePermission, deleteResource,
    getPermissionsByAdminId,
    getResource, getResourcePermission, updatePermissionForActor,
    updateResource
} from "../controllers/permission.controller.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {permissionMiddleware} from "../middlewares/permission.middleware.js";
import {authentication} from "../middlewares/auth.middleware.js";


const permissionRouter = express.Router()
permissionRouter.use(authentication)
permissionRouter.use(permissionMiddleware)
permissionRouter.get('/', asyncHandler(getPermissionsByAdminId))
permissionRouter.get('/resource', asyncHandler(getResource))
permissionRouter.post('/resource', asyncHandler(createResource))
permissionRouter.put('/resource/:resourceId', asyncHandler(updateResource))
permissionRouter.delete('/resource/:id', asyncHandler(deleteResource))

permissionRouter.get('/resource-permission', asyncHandler(getResourcePermission))
permissionRouter.put('/resource-permission/:resourcePermissionId', asyncHandler(updatePermissionForActor))
permissionRouter.delete('/resource-permission/:resourcePermissionId', asyncHandler(deletePermission))
// permissionRouter.

export default permissionRouter
