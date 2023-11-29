import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";


const UserActivityLogSchema = new Schema({
    createdByUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdByUserPage: {
        type: Schema.Types.ObjectId,
        ref: "UserPage",
    },
    actionType: {
        type: String,
        required: true,
        enum: ["like", "comment", "post", "friendRequest", "friendAccept", "groupJoinRequest", "groupDeny", "groupAccept"]
    },
    targetUser: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    targetPage: {
        type: Schema.Types.ObjectId,
        ref: "UserPage"
    },
    targetPost: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    targetGroup: {
        type: Schema.Types.ObjectId,
        ref: "Group"
    },
}, {
    timestamps: true
})

UserActivityLogSchema.plugin(longTimestampsPlugin)
UserActivityLogSchema.plugin(removeVersionFieldPlugin)
const UserActivityLog = mongoose.model("UserActivityLog", UserActivityLogSchema)

export default UserActivityLog
