import {Schema} from "mongoose";

const CommentSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    image: [
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
        ref: 'Comment',
        default: null
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post.js',
        required: true
    }
},
    {
        timestamps: true
    }
);
CommentSchema.index({ user: 1, parent: 1, post: 1, createdAt: -1});
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
    Comment
};
