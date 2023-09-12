import {CreatedResponse, SuccessResponse} from "../core/success/success.response.js";
import {loginHandler, refreshTokenHandler, registerHandler} from "../services/access.service.js";

export const logout = async(req, res, next) => {
    new SuccessResponse({
        message: 'Logout success',
        data: await loginHandler(req.keystore)
    }).send(res)
}

export const refreshToken = async(req, res, next) => {
    new SuccessResponse({
        data: await refreshTokenHandler(req)
    }).send(res)
}
export const login = async(req, res, next) => {
    new SuccessResponse({
        message: "Login successfully",
        data: await loginHandler(req.body)
    }).send(res)
}

export const register = async(req, res, next) => {
    const response = new CreatedResponse({
        message: "Registered successfully!",
        data: await registerHandler(req)
    })
    console.log(response)
    response.send(res)
}
