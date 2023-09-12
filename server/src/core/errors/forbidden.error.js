import {BaseError} from "./base.error.js";

export class ForbiddenError extends BaseError {
    constructor(message) {
        super({message});
        this._statusCode = 401;
        this._message = message;
    }

    _errorMessage() {
        return this._message;
    }
}
