import {CreatedResponse, OkResponse} from "../core/success/success.response.js"
import * as permissionService from "../services/permission.service.js"

export const createResource = async(req, res, next) => {
    new CreatedResponse({
        message: "Created successfully",
        data: await permissionService.createResource(req)
    }).send(res)
}

export const getResource = async(req, res, next) => {
    new OkResponse({
        data: await permissionService.getResource(req)
    }).send(res)
}

export const updateResource = async(req, res, next) => {
    new OkResponse({
        message: await permissionService.updateResource(req)
    }).send(res)
}

export const deleteResource = async(req, res, next) => {
    new OkResponse({
        message: await permissionService.deleteResource(req)
    }).send(res)
}

export const getPermissionsByAdminId = async(req, res, next) => {
    new OkResponse({
        data: await permissionService.getPermissionsByAdminId(req)
    }).send(res)
}

export const getResourcePermission = async(req, res, next) => {
    new OkResponse({
        data: await permissionService.getResourcePermission(req)
    }).send(res)
}

export const createResourcePermission = async(req, res, next) => {
    new CreatedResponse({
        message: "Created successfully",
        data: await permissionService.createResourcePermission(req)
    }).send(res)
}

export const updatePermissionForActor = async(req, res, next) => {
    new OkResponse({
        message: "Updated successfully",
        data: await permissionService.updatePermissionForActor(req)
    }).send(res)
}

export const deletePermission = async(req, res, next) => {
    new OkResponse({
        message: await permissionService.deletePermission(req)
    }).send(res)
}
