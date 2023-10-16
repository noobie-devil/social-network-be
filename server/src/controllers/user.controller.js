import {CreatedResponse, OkResponse} from "../core/success/success.response.js";
import * as userService from "../services/user.service.js"

export const sendFriendRequest = async(req, res, next) => {
    new OkResponse({
        message: await userService.sendFriendRequest(req),
    }).send(res)
}

export const respondToFriendRequest = async(req, res, next) => {
    new OkResponse({
        message: await userService.respondToFriendRequest(req)
    }).send(res)
}


export const getFriendsList = async(req, res, next) => {
    new OkResponse({
        data: await userService.getFriendsList(req)
    }).send(res)
}

export const getFriendRequests = async(req, res, next) => {
    new OkResponse({
        data: await userService.getFriendRequests(req)
    }).send(res)
}

export const createUser = async(req, res, next) => {
    new CreatedResponse({
        data: await userService.createUser(req)
    }).send(res)
}

export const getUserById = async(req, res, next) => {
    new OkResponse({
        data: await userService.findById(req)
    }).send(res)
}

export const updateUserById = async(req, res, next) => {
    new OkResponse({
        data: await userService.updateUserById(req),
        message: "Update success"
    }).send(res)
}
