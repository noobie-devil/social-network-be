import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {
    createEnrollmentYear, deleteEnrollmentYear,
    getEnrollmentYears,
    updateEnrollmentYear
} from "../controllers/enrollmentYear.controller.js";
import {authentication} from "../middlewares/auth.middleware.js";
import {permissionMiddleware} from "../middlewares/permission.middleware.js";

const enrollmentYearRouter = express.Router()
enrollmentYearRouter.get('/', asyncHandler(getEnrollmentYears))
enrollmentYearRouter.use(authentication)
enrollmentYearRouter.use(permissionMiddleware)
enrollmentYearRouter.post('/', asyncHandler(createEnrollmentYear))
enrollmentYearRouter.put('/:id', asyncHandler(updateEnrollmentYear))
enrollmentYearRouter.delete('/:id', asyncHandler(deleteEnrollmentYear))
export default enrollmentYearRouter
