import mongoose, {Schema} from 'mongoose'
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const userTypes = ["User", "UserPage"]

const FollowerSchema = new Schema({
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        followers: [
            {
                userType: {
                    type: String,
                    enum: userTypes,
                    required: true
                },
                followee: {
                    type: Schema.Types.ObjectId,
                },
            }
        ],
        followerCounts: {
            type: Number,
            default: 0
        }
    }
    , {
        timestamps: false
    }
)

FollowerSchema.plugin(longTimestampsPlugin)
FollowerSchema.plugin(removeVersionFieldPlugin)
const Follower = mongoose.model('Follower', FollowerSchema)

export default Follower
