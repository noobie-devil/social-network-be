import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";
import Post from "./post.model.js";

const LikeSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        userPage: {
            type: Schema.Types.ObjectId,
            ref: "UserPage",
            index: true
        },
        userType: {
            type: String,
            enum: ['User', 'UserPage'],
            required: true
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
LikeSchema.plugin(removeVersionFieldPlugin)


const Like = mongoose.model("Like", LikeSchema);

export default Like

