import * as facultyService from '../services/faculty.service.js'
import {CreatedResponse, OkResponse} from "../core/success/success.response.js";

export const createFaculty = async(req, res, next) => {
    new CreatedResponse({
        data: await facultyService.createFaculty(req)
    }).send(res);
}

export const updateFaculty = async(req, res, next) => {
    new OkResponse({
        message: "Update success",
        data: await facultyService.updateFaculty(req)
    }).send(res)
}

export const deleteFaculty = async(req, res, next) => {
    new OkResponse({
        message: await facultyService.deleteFaculty(req)
    }).send(res)
}
