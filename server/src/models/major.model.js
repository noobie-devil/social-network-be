import mongoose, { Schema } from "mongoose";

const MajorSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    // name: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    name: [
        {
            lang: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }
    ],
    faculty: {
        type: mongoose.Types.ObjectId,
        ref: "Faculty"
    }
})

MajorSchema.path('name').validate(function (value) {
    const langSet = new Set()
    let duplicateData
    for(const item of value) {
        if(langSet.has(item.lang)) {
            duplicateData = item.lang
            return false
        }
        langSet.add(item.lang)
    }
    return true
}, 'Type `{VALUE}` existed', 'Duplicate data')

MajorSchema.path('name').validate(function (value) {
    const langSet = new Set()
    let duplicateData
    for(const item of value) {
        if(langSet.has(item.value)) {
            duplicateData = item.value
            return false
        }
        langSet.add(item.value)
    }
    return true
}, 'Value `{VALUE}` existed', 'Duplicate data')



MajorSchema.index({code: 1, name: 1, faculty: 1}, {
    unique: true, sparse: true
})

const Major = mongoose.model('Major', MajorSchema)

export default Major
