import {SuccessResponse} from "../core/success/success.response.js"
import * as uploadService from '../services/assetResource.service.js'

export const uploadAssetResource = async(req, res, next) => {
    new SuccessResponse({
        data: await uploadService.uploadAssetResource(req)
    }).send(res)
}
