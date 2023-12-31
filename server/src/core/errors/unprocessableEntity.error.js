import {BaseError} from "./base.error.js";

export class UnprocessableEntityError extends BaseError {
    constructor(message) {
        super({message})
        this._statusCode = 422
        this._message = message || "UnprocessableEntity"
    }

    _errorMessage() {
        return this._message
    }
}