import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {createFaculty, deleteFaculty, updateFaculty} from "../controllers/faculty.controller.js";

const facultyRouter = express.Router()

facultyRouter.use(authentication)
// facultyRouter.get('/', asyncHandler(getFaculties))
facultyRouter.post('/', asyncHandler(createFaculty))
facultyRouter.put('/:facultyId', asyncHandler(updateFaculty))
facultyRouter.delete('/:facultyId', asyncHandler(deleteFaculty))
export default facultyRouter
