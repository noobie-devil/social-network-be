import {BaseError} from "./BaseError.js";

export class InvalidTokenError extends BaseError {


    constructor(message) {
        super({message});
        this._statusCode = 401;
    }

    _errorMessage() {
        return "Invalid token";
    }


}
