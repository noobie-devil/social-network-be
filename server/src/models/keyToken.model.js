import mongoose, { Schema } from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const KeyTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    },
    publicKey: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    refreshTokenUsed: {
        type: Array,
        default: []
    },
    refreshToken: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

KeyTokenSchema.plugin(longTimestampsPlugin)
KeyTokenSchema.plugin(removeVersionFieldPlugin)
const KeyToken = mongoose.model("KeyToken", KeyTokenSchema);

export default KeyToken;
