import {SuccessReasonStatusCode, SuccessStatusCode} from "../utils/constants.js";

class SuccessResponse {
    constructor({message = SuccessReasonStatusCode.OK, statusCode = SuccessStatusCode.OK}, data = {}) {
        this.message = message
        this.status = statusCode
        this.data = data
    }


    send(res, headers= {}) {
        return res.status(this.status).json(this)
    }
}
