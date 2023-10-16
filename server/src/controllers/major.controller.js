import {CreatedResponse, OkResponse} from "../core/success/success.response.js";
import * as majorService from "../services/major.service.js";
import major from "../routes/major/index.js";


export const createMajor = async(req, res, next) => {
    new CreatedResponse({
        data: await majorService.createMajor(req)
    }).send(res)
}

export const updateMajor = async(req, res, next) => {
    new OkResponse({
        message: "Update success",
        data: await majorService.updateMajor(req)
    }).send(res)
}

export const deleteMajor = async(req, res, next) => {
    new OkResponse({
        message: await majorService.deleteMajor(req)
    }).send(res)
}

