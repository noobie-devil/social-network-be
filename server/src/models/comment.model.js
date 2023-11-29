import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const CommentSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    images: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Image'
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
);
CommentSchema.plugin(longTimestampsPlugin)
CommentSchema.plugin(removeVersionFieldPlugin)
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
    Comment
};
