import {BaseError} from "./base.error.js";

export class ForbiddenError extends BaseError {
    constructor(message) {
        super({message});
        this._statusCode = 401;
        this._message = message || "Access Denied. You do not have permission to perform this action";
    }

    _errorMessage() {
        return this._message;
    }
}
