import express from "express";
import {
    createResource, createResourcePermission, deletePermission, deleteResource,
    getPermissionsByAdminId,
    getResource, getResourcePermission, updatePermissionForActor,
    updateResource
} from "../controllers/permission.controller.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {permissionMiddleware} from "../middlewares/permission.middleware.js";
import {authentication} from "../middlewares/auth.middleware.js";


const permissionRouter = express.Router()
permissionRouter.use(authentication)
permissionRouter.get('/', asyncHandler(getPermissionsByAdminId))
permissionRouter.use(permissionMiddleware)
permissionRouter.get('/resource', asyncHandler(getResource))
permissionRouter.post('/resource', asyncHandler(createResource))
permissionRouter.put('/resource/:resourceId', asyncHandler(updateResource))
permissionRouter.delete('/resource/:id', asyncHandler(deleteResource))

permissionRouter.get('/resource-permission', asyncHandler(getResourcePermission))
permissionRouter.post('/resource-permission', asyncHandler(createResourcePermission))
permissionRouter.put('/resource-permission/:resourcePermissionId', asyncHandler(updatePermissionForActor))
permissionRouter.delete('/resource-permission/:resourcePermissionId', asyncHandler(deletePermission))

export default permissionRouter
