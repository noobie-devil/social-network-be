import mongoose, { Schema } from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

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
    name: {
        type: Map,
        of: {
            type: String
        },
        validate: {
            validator: function (value) {
                const valueArray = Array.from(value.values())
                return new Set(valueArray).size === valueArray.length
            },
            message: 'Values in name must be unique'
        }
    },
    faculty: {
        type: mongoose.Types.ObjectId,
        ref: "Faculty"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }
},
{
    timestamps: true,
    validateBeforeSave: true
})

MajorSchema.plugin(longTimestampsPlugin)
MajorSchema.plugin(removeVersionFieldPlugin)
MajorSchema.pre('findOneAndUpdate', function(next) {
    console.log(this.getUpdate())
    console.log(this.name)
    this.options.runValidators = true
    this.options.validateModifiedOnly
    next()
})
MajorSchema.pre('save', function (next) {
    console.log('preSave')
    next()
})
MajorSchema.pre('update', function (next) {
    console.log('preUpdate')
    next()
})
MajorSchema.path('name').validate(function (value) {
    const valueArray = Array.from(value.values())
    console.log("run")
    return new Set(valueArray).size === valueArray.length
}, 'Values in name must be unique')

MajorSchema.index({code: 1, faculty: 1}, {
    unique: true, sparse: true
})

const Major = mongoose.model('Major', MajorSchema)

export default Major
