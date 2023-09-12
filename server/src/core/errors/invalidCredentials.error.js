import {BaseError} from "./base.error.js";

export class InvalidCredentialsError extends BaseError {

    constructor(message) {
        super({message});
        this._statusCode = 401;
    }

    _errorMessage() {
        return "Invalid credentials";
    }
}
