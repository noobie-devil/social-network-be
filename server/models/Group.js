import {Schema} from "mongoose";

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
        admin: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        public_policies: {
            type: String,
            enum: ["Public", "Private"],
            default: "Public"
        }
    }
);
GroupSchema.index({ name: 1});
const Group = mongoose.model('Group', GroupSchema);

module.exports = {
    Group
};
