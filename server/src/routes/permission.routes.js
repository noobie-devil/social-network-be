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
permissionRouter.get('/', permissionMiddleware, asyncHandler(getPermissionsByAdminId))

const resourceSegmentRouter = express.Router()
resourceSegmentRouter.use(permissionMiddleware)
resourceSegmentRouter.get("/", asyncHandler(getResource))
resourceSegmentRouter.post('/', asyncHandler(createResource))
resourceSegmentRouter.put('/:resourceId', asyncHandler(updateResource))
resourceSegmentRouter.delete('/:resourceId', asyncHandler(deleteResource))

// permissionRouter.use(permissionMiddleware)
// permissionRouter.get('/resource', asyncHandler(getResource))
// permissionRouter.post('/resource', asyncHandler(createResource))
// permissionRouter.put('/resource/:resourceId', asyncHandler(updateResource))
// permissionRouter.delete('/resource/:resourceId', asyncHandler(deleteResource))

const resourcePermissionRouter = express.Router()
resourcePermissionRouter.use(permissionMiddleware)
resourcePermissionRouter.get('/', asyncHandler(getResourcePermission))
resourcePermissionRouter.post('/', asyncHandler(createResourcePermission))
resourcePermissionRouter.put('/:resourcePermissionId', asyncHandler(updatePermissionForActor))
resourcePermissionRouter.delete('/:resourcePermissionId', asyncHandler(deletePermission))

permissionRouter.use('/resource', resourceSegmentRouter)
permissionRouter.use('/resource-permission', resourceSegmentRouter)


// permissionRouter.get('/resource-permission', asyncHandler(getResourcePermission))
// permissionRouter.post('/resource-permission', asyncHandler(createResourcePermission))
// permissionRouter.put('/resource-permission/:resourcePermissionId', asyncHandler(updatePermissionForActor))
// permissionRouter.delete('/resource-permission/:resourcePermissionId', asyncHandler(deletePermission))

export default permissionRouter
