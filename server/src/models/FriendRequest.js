import mongoose, { Schema } from "mongoose";
import {longTimestampsPlugin} from "../database/plugins.js";

const FriendRequestSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: Number,
            enum: [1, -1, 0],
            required: true
        }
    },
    {
        timestamps: true
    }
);

FriendRequestSchema.plugin(longTimestampsPlugin);
FriendRequestSchema.index({ 'sender': 1, "receiver": 1, "updatedAt": -1, "createdAt": 1, 'status': -1 }, { sparse: true, unique: true });

const FriendRequest = mongoose.model("FriendRequest", FriendRequestSchema);

module.exports = {
    FriendRequest
};
