import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {createFaculty, deleteFaculty, getFaculty, updateFaculty} from "../controllers/faculty.controller.js";
import {permissionMiddleware} from "../middlewares/permission.middleware.js";

const facultyRouter = express.Router()

// facultyRouter.use(authentication)
facultyRouter.get('/', asyncHandler(getFaculty))
facultyRouter.use(authentication)
facultyRouter.use(permissionMiddleware)
facultyRouter.post('/', asyncHandler(createFaculty))
facultyRouter.put('/:facultyId', asyncHandler(updateFaculty))
facultyRouter.delete('/:facultyId', asyncHandler(deleteFaculty))
export default facultyRouter
