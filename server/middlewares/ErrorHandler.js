import {ValidationError} from "../errors/ValidationError.js";
import {NotFoundError} from "../errors/NotFoundError.js";
import {InvalidTokenError} from "../errors/InvalidTokenError.js";
import {InternalServerError} from "../errors/InternalServerError.js";
import {BaseError} from "../errors/BaseError.js";

const errorMap = {
    ValidationError,
    NotFoundError,
    InvalidTokenError,
    InternalServerError
}


function errorHandler(err, req, res) {
    // const mappedError = mapError(err);
    // console.log(mappedError);
    if(!(err instanceof BaseError)) {
        err = new InternalServerError();
    }
    return res.status(err.statusCode).json({ error: err.errorMessage });
}


export default errorHandler;
