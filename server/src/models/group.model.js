import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const GroupSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        hostGroup: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        privacyMode: {
            type: Number,
            enum: [0, 1],
            default: 1
        },
        description: {
            type: String,
        },
        moderationMode: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

GroupSchema.plugin(longTimestampsPlugin)
GroupSchema.plugin(removeVersionFieldPlugin)
GroupSchema.index({ name: 1});
const Group = mongoose.model('Group', GroupSchema);

module.exports = {
    Group
};
