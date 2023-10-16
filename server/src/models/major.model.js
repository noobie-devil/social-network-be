import mongoose, { Schema } from "mongoose";

const MajorSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    faculty: {
        type: mongoose.Types.ObjectId,
        ref: "Faculty"
    }
})

MajorSchema.index({code: 1, name: 1, faculty: 1}, {
    unique: true, sparse: true
})

const Major = mongoose.model('Major', MajorSchema)

export default Major
