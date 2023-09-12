import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        lastName: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
            sparse: true
        },
        password: {
            type: String,
            required: true,
            min: 8,
        },
        picturePath: {
            type: String,
            default: "",
        },
        friends: [
            {
                relation: {
                    type: Schema.Types.ObjectId,
                    ref: 'FriendRequest',
                    required: true
                },
                default: []
            }
        ],
        status: {
            type: String,
            default: "active"
        },
        viewProfile: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", UserSchema);
UserSchema.pre('save', async (next) => {
    if(!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt()
})
UserSchema.index({'email': 1}, { sparse: true, unique: true});

export default User;







