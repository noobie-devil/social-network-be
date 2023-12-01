import {BaseError} from "./base.error.js";


export class UnsupportedFileFormatError extends BaseError {
    constructor(message) {
        super({message})
        this._statusCode = 415
    }

    _errorMessage() {
        return "Unsupported file type"
    }
}
