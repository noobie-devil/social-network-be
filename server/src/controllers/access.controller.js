import {CreatedResponse, SuccessResponse} from "../core/success/success.response.js";
import * as accessService from "../services/access.service.js";

export const logout = async(req, res, next) => {
    new SuccessResponse({
        message: await accessService.logoutWithParams(req)
    }).send(res)
}

export const userRefreshToken = async(req, res, next) => {
    new SuccessResponse({
        data: await accessService.refreshTokenHandler(req, false)
    }).send(res)
}
export const userLogin = async(req, res, next) => {
    new SuccessResponse({
        message: "Login successfully",
        // data: await accessService.loginHandler(req.body)
        data: await accessService.login(req, false)
    }).send(res)
}

export const userRegister = async(req, res, next) => {
    const response = new CreatedResponse({
        message: "Registered successfully",
        // data: await accessService.registerHandler(req)
        data: await accessService.register(req)
    })
    console.log(response)
    response.send(res)
}

export const adminLogin = async(req, res, next) => {
    new SuccessResponse({
        message: "Login successfully",
        data: await accessService.login(req, true)
    }).send(res)
}

export const adminRefreshToken = async(req, res, next) => {
    new SuccessResponse({
        data: await accessService.refreshTokenHandler(req, true)
    }).send(res)
}
