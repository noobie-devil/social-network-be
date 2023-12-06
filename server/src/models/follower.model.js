import mongoose, {Schema} from 'mongoose'
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const userTypes = ["User", "UserPage"]

const FollowerSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            dropDups: true
        },
        userPage: {
            type: Schema.Types.ObjectId,
            ref: "UserPage",
            unique: true,
            dropDups: true
        },
        followers: [
            {
                userType: {
                    type: String,
                    enum: userTypes,
                    required: true
                },
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    unique: true,
                    dropDups: true
                },
                page: {
                    type: Schema.Types.ObjectId,
                    ref: "UserPage",
                    unique: true,
                    dropDups: true
                }
            }
        ],
        followerCounts: {
            type: Number,
            default: 0
        },
        following: [
            {
                userType: {
                    type: String,
                    enum: userTypes,
                    required: true
                },
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    unique: true,
                    dropDups: true
                },
                page: {
                    type: Schema.Types.ObjectId,
                    ref: "UserPage",
                    unique: true,
                    dropDups: true
                }
            }
        ]
    }
    ,
    {
        timestamps: false
    }
)

FollowerSchema.plugin(longTimestampsPlugin)
FollowerSchema.plugin(removeVersionFieldPlugin)
const Follower = mongoose.model('Follower', FollowerSchema)

export default Follower
