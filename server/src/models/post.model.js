import mongoose, { Schema } from "mongoose";
import {longTimestampsPlugin} from "../database/plugins.js";

const PostSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
        },
        content: {
            type: String,
        },
        images: [
            {
                image: {
                    type: Schema.Types.ObjectId,
                    ref: 'ImageSchema'
                }
            }
        ],
        likeCounts: {
            type: Number,
        },
        refPost: {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    },
    {
        timestamps: true
    }
);
PostSchema.plugin(longTimestampsPlugin);
PostSchema.index({ user: 1, group: 1, createdAt: -1}, {
    sparse: true,
    unique: true
});
const Post = mongoose.model('Post', PostSchema);

module.exports = {
    Post
};
