import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {createMajor, deleteMajor, getMajor, updateMajor} from "../controllers/major.controller.js";
import {permissionMiddleware} from "../middlewares/permission.middleware.js";

const majorRouter = express.Router()

majorRouter.get('/', asyncHandler(getMajor))
majorRouter.use(authentication)
majorRouter.use(permissionMiddleware)
majorRouter.post('/', asyncHandler(createMajor))
majorRouter.put("/:majorId", asyncHandler(updateMajor))
majorRouter.delete("/:majorId", asyncHandler(deleteMajor))

export default majorRouter
