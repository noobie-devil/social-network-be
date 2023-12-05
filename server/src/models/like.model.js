import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin} from "../database/plugins.js";

const LikeSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        userPage: {
            type: Schema.Types.ObjectId,
            ref: "UserPage",
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },

    },
    {
        timestamps: true
    }
);

LikeSchema.plugin(longTimestampsPlugin);
LikeSchema.index({user: 1, post: 1, createdAt: -1}, {
    sparse: true,
    unique: true
});
const Like = mongoose.model("Like", LikeSchema);

module.exports = {
    Like
};

