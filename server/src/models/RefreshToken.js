import { Schema, model } from "mongoose";

const RefreshTokenSchema = new Schema({
    jwtId: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Number,
        default: Date,
        required: true,
        set: dateToNumber
    }
})

function dateToNumber(date) {
    return new Date(date).getTime();
}

const RefreshToken = model('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
