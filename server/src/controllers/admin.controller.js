import {CreatedResponse} from "../core/success/success.response.js"
import * as adminService from "../services/admin.service.js"

export const createAdmin = async(req, res, next) => {
    new CreatedResponse({
        message: "Created successfully",
        data: await adminService.create(req)
    }).send(res)
}
