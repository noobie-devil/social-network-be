import {CreatedResponse} from "../core/success/success.response.js"
import * as permissionService from "../services/permission.service.js"

export const createResource = async(req, res, next) => {
    new CreatedResponse({
        message: "Created successfully",
        data: await permissionService.createResource(req)
    }).send(res)
}
