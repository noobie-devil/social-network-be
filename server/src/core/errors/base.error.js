export class BaseError extends Error {
    constructor({message = null} = {}) {
        super(message);
        this._name = this.constructor.name;
        this._message = message;
        this._statusCode = 500;

        Error.captureStackTrace(this, this.constructor);
    }


    _errorMessage() {
        throw new Error("Method not implemented.");
    }

    get name() {
        return this._name;
    }

    get errorMessage() {
        return this._errorMessage() || this._message;
    }

    get statusCode() {
        return this._statusCode;
    }

}
