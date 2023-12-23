import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {
    addToGroup, changeAdminPassword, changeAdminUsername,
    createAdmin,
    createAdminGroup, deleteAdmin, deleteAdminGroup,
    getAdmin, getAdminGroup,
    removeFromGroup,
    updateAdminGroup
} from "../controllers/admin.controller.js";
import {authentication} from "../middlewares/auth.middleware.js";
import {adminLogin, adminRefreshToken} from "../controllers/access.controller.js";
import {permissionMiddleware} from "../middlewares/permission.middleware.js";


const adminRouter = express.Router()
adminRouter.post('/login', asyncHandler(adminLogin))
adminRouter.post('/refresh-token', asyncHandler(adminRefreshToken))

adminRouter.use(authentication)
adminRouter.put('/:adminId/change-password', asyncHandler(changeAdminPassword))
adminRouter.put('/:adminId/change-username', asyncHandler(changeAdminUsername))

const adminSegmentRouter = express.Router()
adminSegmentRouter.use(permissionMiddleware)
adminSegmentRouter.get('/', asyncHandler(getAdmin))
adminSegmentRouter.post('/', asyncHandler(createAdmin))
adminSegmentRouter.delete('/:adminId', asyncHandler(deleteAdmin))

// adminSegmentRouter.put('/:adminId/change-password', asyncHandler(changeAdminPassword))
// adminSegmentRouter.put('/:adminId/change-username', asyncHandler(changeAdminUsername))

const adminGroupsRouter = express.Router()
adminGroupsRouter.use(permissionMiddleware)
adminGroupsRouter.get('/', asyncHandler(getAdminGroup))
adminGroupsRouter.post('/', asyncHandler(createAdminGroup))
adminGroupsRouter.put('/:groupId', asyncHandler(updateAdminGroup))
adminGroupsRouter.delete('/:groupId', asyncHandler(deleteAdminGroup))
adminGroupsRouter.post('/:groupId/admins', asyncHandler(addToGroup))
adminGroupsRouter.delete('/:groupId/admins', asyncHandler(removeFromGroup))

adminRouter.use('/admin', adminSegmentRouter)

adminRouter.use('/admin-groups', adminGroupsRouter)

export default adminRouter
