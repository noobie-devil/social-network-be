import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const PostSchema = new Schema(
    {
        userAuthor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        userPageAuthor: {
            type: Schema.Types.ObjectId,
            ref: "UserPage",
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
                type: Schema.Types.ObjectId,
                ref: "Image"
            }
        ],
        likeCounts: {
            type: Number,
            default: 0
        },
        likes: [
            {
                userType: {
                    type: String,
                    enum: ["User", "UserPage"],
                    required: true
                },
                userId : {
                    type: Schema.Types.ObjectId
                }
            }
        ],
        sharedPost: {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        },
        privacyMode: {
            type: Number,
            enum: [0, 1, 2],
            default: 1
        },
        tags: [
            {type: String}
        ],
        shares: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);
PostSchema.plugin(removeVersionFieldPlugin)
PostSchema.plugin(longTimestampsPlugin);
PostSchema.index({user: 1, group: 1, createdAt: -1}, {
    sparse: true,
    unique: true
});
const Post = mongoose.model('Post', PostSchema);

module.exports = {
    Post
};
