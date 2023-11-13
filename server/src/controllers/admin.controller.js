import {CreatedResponse, OkResponse} from "../core/success/success.response.js"
import * as adminService from "../services/admin.service.js"

export const createAdmin = async(req, res, next) => {
    new CreatedResponse({
        message: "Created successfully",
        data: await adminService.createAdmin(req)
    }).send(res)
}

export const createAdminGroup = async(req, res, next) => {
    new CreatedResponse({
        message: "Created successfully",
        data: await adminService.createAdminGroup(req)
    }).send(res)
}

export const addToGroup = async(req, res, next) => {
    new OkResponse({
        message: "Updated successfully",
        data: await adminService.addToGroup(req)
    }).send(res)
}

export const removeFromGroup = async(req, res, next) => {
    new OkResponse({
        message: "Updated successully",
        data: await adminService.removeFromGroup(req)
    }).send(res)
}


