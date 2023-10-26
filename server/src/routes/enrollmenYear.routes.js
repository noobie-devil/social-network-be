import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {
    createEnrollmentYear, deleteEnrollmentYear,
    getEnrollmentYears,
    updateEnrollmentYear
} from "../controllers/enrollmentYear.controller.js";
import {authentication} from "../middlewares/auth.middleware.js";

const enrollmentYearRouter = express.Router()
enrollmentYearRouter.use(authentication)
enrollmentYearRouter.post('/', asyncHandler(createEnrollmentYear))
enrollmentYearRouter.get('/', asyncHandler(getEnrollmentYears))
enrollmentYearRouter.put('/:id', asyncHandler(updateEnrollmentYear))
enrollmentYearRouter.delete('/:id', asyncHandler(deleteEnrollmentYear))
export default enrollmentYearRouter
