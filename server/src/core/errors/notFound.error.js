import {BaseError} from "./BaseError.js";

export class NotFoundError extends BaseError {

    constructor(message) {
        super({message});
        this._statusCode = 404;
        this._message = message || "Resource not found";
    }

    _errorMessage() {
        return "Resource not found";
    }

}
