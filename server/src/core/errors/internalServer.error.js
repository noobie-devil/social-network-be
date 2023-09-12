import {BaseError} from "./base.error.js";

export class InternalServerError extends BaseError {


    constructor(message) {
        super({message});
    }

    _errorMessage() {
        return "Internal server error";
    }

}
