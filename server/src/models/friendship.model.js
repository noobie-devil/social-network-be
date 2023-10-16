import mongoose, { Schema } from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const FriendshipSchema = new Schema(
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
            type: String,
            enum: ['Pending', "Accepted", "Rejected"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

FriendshipSchema.plugin(longTimestampsPlugin);
FriendshipSchema.plugin(removeVersionFieldPlugin);
FriendshipSchema.index({ 'sender': 1, "receiver": 1, "createdAt": 1 }, { sparse: true, unique: true });
// FriendshipSchema.index({ "sender.lastName": "text"})
const Friendship = mongoose.model("Friendship", FriendshipSchema);

export default Friendship;
