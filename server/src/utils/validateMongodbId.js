import mongoose from "mongoose";

export const validateMongodbId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new Error('This id is not valid or not found');
}


export const isValidMongoId = (value, helpers) => {
    if(!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
}

export const isExistsUsername = (value, helpers) => {

}

export const maximumCurrentYear = (value, helpers) => {
    const currentYear = new Date().getFullYear()
    if(Number(value) > currentYear) {
        return helpers.error('any.invalid')
    }
    return value
}
