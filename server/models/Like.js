import {Schema} from "mongoose";

const LikeSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post.js',
            required: true
        },

    },
    {
        timestamps: true
    }
);
LikeSchema.index({user: 1, post: 1, createdAt: -1}, {
    sparse: true,
    unique: true
});
const Like = mongoose.model("Like", LikeSchema);

module.exports = {
    Like
};

