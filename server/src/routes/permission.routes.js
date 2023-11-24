import express from "express";
import {createResource} from "../controllers/permission.controller.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {permissionMiddleware} from "../middlewares/permission.middleware.js";
import {authentication} from "../middlewares/auth.middleware.js";


const permissionRouter = express.Router()
permissionRouter.use(authentication)
permissionRouter.use(permissionMiddleware)
permissionRouter.post('/resource', asyncHandler(createResource))


export default permissionRouter
