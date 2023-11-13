import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {createAdmin, createAdminGroup} from "../controllers/admin.controller.js";


const adminRouter = express.Router()
adminRouter.post('/', asyncHandler(createAdmin))

adminRouter.post('/admin-groups', asyncHandler(createAdminGroup))
adminRouter.put('/admin-groups', asyncHandler())
adminRouter.delete('/admin-groups', asyncHandler())
adminRouter.post('/admin-groups/:groupId/admins', asyncHandler())
adminRouter.delete('/admin-groups/:groupId/admins', asyncHandler())
export default adminRouter
