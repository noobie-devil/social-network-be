import mongoose, {Schema} from "mongoose";

const FacultySchema = new Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    majors: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Major"
        }
    ]
})

FacultySchema.index({ code: 1, name: 1}, {
    unique: true
})
const Faculty = mongoose.model('Faculty', FacultySchema)

export default Faculty
