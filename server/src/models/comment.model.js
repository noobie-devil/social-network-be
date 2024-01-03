import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const CommentSchema = new Schema({
    text: {
        type: String,
    },
    images: [
        {
            type: Schema.Types.ObjectId,
            ref: 'ResourceStorage'
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    childComments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
},
    {
        timestamps: true
    }
)
export const requiredPopulatedComment = [
    {
        path: "images",
        select: "url"
    },
    {
        path: "user",
        select: "firstName lastName avatar username",
        populate: [
            {
                path: "avatar",
                select: "url"
            }
        ]
    }
]
CommentSchema.plugin(longTimestampsPlugin)
CommentSchema.plugin(removeVersionFieldPlugin)
const Comment = mongoose.model('Comment', CommentSchema);

export default Comment
