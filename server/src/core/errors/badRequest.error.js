import {BaseError} from "./base.error.js";

export class BadRequestError extends BaseError {
    constructor(message) {
        super({message});
        this._statusCode = 400;
        this._message = message || "Bad Request";
    }

    _errorMessage() {
        return this._message;
    }
}
