import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            default: []
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
        }
    },
    {
        timestamps: true
    }
);
PostSchema.index({ user: 1, group: 1, createdAt: -1}, {
    sparse: true,
    unique: true
});
const Post = mongoose.model('Post', PostSchema);

module.exports = {
    Post
};
