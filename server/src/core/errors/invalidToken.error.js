import {BaseError} from "./base.error.js";

export class InvalidTokenError extends BaseError {


    constructor(message) {
        super({message});
        this._statusCode = 401;
        this._message = message || "Invalid token";
    }

    _errorMessage() {
        return this._message;
    }


}
