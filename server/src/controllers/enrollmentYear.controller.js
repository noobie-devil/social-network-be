import {CreatedResponse, OkResponse} from "../core/success/success.response.js";
import * as enrollmentYearService from "../services/enrollmentYear.service.js";


export const createEnrollmentYear = async(req, res, next) => {
    new CreatedResponse({
        data: await enrollmentYearService.createEnrollmentYear(req)
    }).send(res)
}

export const getEnrollmentYears = async(req, res, next) => {
    new OkResponse({
        data: await enrollmentYearService.getEnrollmentYears(req)
    }).send(res)
}

export const updateEnrollmentYear = async(req, res, next) => {
    new OkResponse({
        data: await enrollmentYearService.updateEnrollmentYear(req)
    }).send(res)
}

export const deleteEnrollmentYear = async(req, res, next) => {
    new OkResponse({
        message: await enrollmentYearService.deleteEnrollmentYear(req)
    }).send(res)
}
