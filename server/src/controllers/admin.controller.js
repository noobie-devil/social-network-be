import {CreatedResponse, OkResponse, SuccessResponse} from "../core/success/success.response.js"
import * as adminService from "../services/admin.service.js"


export const getAdmin = async(req, res, next) => {
    new SuccessResponse({
        data: await adminService.getAdmin(req)
    }).send(res)
}
export const createAdmin = async(req, res, next) => {
    new CreatedResponse({
        message: "Created successfully",
        data: await adminService.createAdmin(req)
    }).send(res)
}

export const changeAdminPassword = async(req, res, next) => {
    new SuccessResponse({
        message: "Updated successfully",
        data: await adminService.changeAdminPassword(req)
    }).send(res)
}

export const changeAdminUsername = async(req, res, next) => {
    new SuccessResponse({
        message: "Updated successfully",
        data: await adminService.changeAdminUsername(req)
    }).send(res)
}

export const deleteAdmin = async(req, res, next) => {
    console.log(req.route)
    console.log(req.baseUrl)
    console.log(req.originalUrl)

    new SuccessResponse({
        message: await adminService.deleteAdmin(req)
    }).send(res)
}


export const getAdminGroup = async(req, res, next) => {
    new SuccessResponse({
        data: await adminService.getAdminGroup(req)
    }).send(res)
}

export const createAdminGroup = async(req, res, next) => {
    new CreatedResponse({
        message: "Created successfully",
        data: await adminService.createAdminGroup(req)
    }).send(res)
}

export const updateAdminGroup = async(req, res, next) => {
    new SuccessResponse({
        message: "Updated successfully",
        data: await adminService.updateAdminGroup(req)
    }).send(res)
}

export const deleteAdminGroup = async(req, res, next) => {
    new SuccessResponse({
        message: await adminService.deleteAdminGroup(req)
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
        message: await adminService.removeFromGroup(req)
    }).send(res)
}


