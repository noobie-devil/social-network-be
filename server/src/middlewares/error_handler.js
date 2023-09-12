import {NotFoundError} from "../core/errors/notFound.error.js";
import {InternalServerError} from "../core/errors/internalServer.error.js";
import {BaseError} from "../core/errors/base.error.js";
import {ValidationError} from "../core/errors/validation.error.js";
import Joi from "joi";


export const notFound = (req, res, next) => {
    const error = new NotFoundError();
    next(error);
}

export const errorHandler = (err, req, res, next) => {
    console.log("Error caught in errorHandler:", err.stack);

    if(err instanceof Joi.ValidationError) {
        err = new ValidationError({
            error: err
        })
    }
    if(!(err instanceof BaseError)) {
        err = new InternalServerError();
    }
    if(err.errorMessage) {
        return res.status(err.statusCode).json({ error: err.errorMessage });
    } else {
        return res.status(err.statusCode);

    }
}
