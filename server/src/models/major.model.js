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
    }
},
{
    timestamps: true,
    validateBeforeSave: true
})

MajorSchema.plugin(longTimestampsPlugin)
MajorSchema.plugin(removeVersionFieldPlugin)
MajorSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true
    next()
})

MajorSchema.pre('save', function(next) {
    const update = this.getUpdate()
    const {name} = update.$set
    const langSet = new Set();
    for (const key in name) {
        console.log(key)
        if (langSet.has(name[key])) {
            const error = new Error('Values in name must be unique');
            return next(error);
        }
        langSet.add(name[key]);
    }
    next()
})

MajorSchema.index({code: 1, faculty: 1}, {
    unique: true, sparse: true
})

const Major = mongoose.model('Major', MajorSchema)

export default Major
