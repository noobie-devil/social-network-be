import Joi from "joi";
import {BaseError} from "./base.error.js";

export class ValidationError extends BaseError {

    constructor({message = null, error = null, statusCode = null} = {}) {
        super({message});
        console.log("ValidationError created with error:", error); // add this line
        this._error = error;
        this._statusCode = statusCode || 400;
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
