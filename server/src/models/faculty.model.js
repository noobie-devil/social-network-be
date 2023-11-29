import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const FacultySchema = new Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }
})


FacultySchema.plugin(longTimestampsPlugin)
FacultySchema.plugin(removeVersionFieldPlugin)
FacultySchema.index({ code: 1, name: 1}, {
    unique: true
})
const Faculty = mongoose.model('Faculty', FacultySchema)

export default Faculty
