import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import config from "../utils/global_config.js";
import {longTimestampsPlugin} from "../database/plugins.js";

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
        username: {
            type: String,
            max: 50,
            unique: true
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

UserSchema.plugin(longTimestampsPlugin);
UserSchema.pre('save', async function (next) {
    if(!this.isNew && !this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(config.BCRYPT.SALT);
    this.password = await bcrypt.hashSync(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.index({'email': 1}, { sparse: true, unique: true});

const User = mongoose.model("User", UserSchema);

export default User;







