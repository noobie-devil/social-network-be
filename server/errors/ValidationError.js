import Joi from "joi";
import {BaseError} from "./BaseError.js";

export class ValidationError extends BaseError {
    // constructor(message, error, statusCode) {
    //     super(message, error);
    //     this._statusCode = statusCode;
    // }

    constructor({message = null, error = null, statusCode = null} = {}) {
        super({message});
        this._error = error;
        super._statusCode = statusCode || 400;
    }

    _errorMessage() {
        if(this._error instanceof Joi.ValidationError) {
            const errorMessage = this._error.details.map(
                value => value.message
            ).join(", ");
            return `Validation error: ${errorMessage}`;
        } else {
            return this._message;
        }
    }

}
