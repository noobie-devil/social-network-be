import {SuccessReasonStatusCode, SuccessStatusCode} from "../utils/constants.js";

export class SuccessResponse {
    constructor({message = SuccessReasonStatusCode.OK, statusCode = SuccessStatusCode.OK, data = {}}) {
        this.message = message
        this.status = statusCode
        this.data = data
    }


    send(res, headers= {}) {
        return res.status(this.status).json(this)
    }
}

export class OkResponse extends SuccessResponse {
    constructor({ message = SuccessReasonStatusCode.OK, data }) {
        super({ message, statusCode: SuccessStatusCode.OK, data })
    }
}

export class CreatedResponse extends SuccessResponse {
    constructor({ message = SuccessReasonStatusCode.CREATED, data }) {
        super({ message, statusCode: SuccessStatusCode.CREATED, data })
    }
}
