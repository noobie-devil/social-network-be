import mongoose, {Schema} from "mongoose";
import moment from 'moment';
import bcrypt from "bcrypt";
import config from "../utils/global.config.js";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";
import removeAccents from 'remove-accents'
import {getUnSelectObjFromSelectArr} from "../utils/lodash.utils.js";


const UserSchema = new Schema({
    identityCode: {
      type: String,
      required: true
    },
    firstName: {
        type: String,
        required: true,
        min: 2,
        max: 50
    },
    lastName: {
        type: String,
        required: true,
        min: 2,
        max: 50,
    },
    email: {
        type: String,
        required: true,
        max: 50,
    },
    username: {
        type: String,
        max: 50,
        default: ""
    },
    password: {
        type: String,
        required: true,
        min: 8,
    },
    homeTown: {
        type: String,
        required: true,
    },
    birthdate: {
        type: String,
        validate: {
            validator: function(value) {
                return moment(value, 'DD/MM/YYYY', true).isValid()
            },
            message: 'Invalid birthdate format'
        },
        required: true
    },
    avatar: {
        type: Schema.Types.ObjectId,
        ref: "ResourceStorage"
    },
    status: {
        type: Number,
        default: -1,
        enum: [-1, 0, 1]
    },
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    friendCount: {
        type: Number,
        default: 0
    },
    details: {
        type: Schema.Types.Mixed,
        required: true
    },
    type: {
        type: Number,
        required: true,
        enum: [1,2,3]
    },
    introduce: {
        type: String,
        max: 150
    }
}, {
    timestamps: true
})

const CollegeStudentSchema = new Schema({
    graduated: {
        type: Boolean,
        required: true,
    },
    classCode: {
        type: String,
        sparse: true
    },
    faculty: {
        type: Schema.Types.ObjectId,
        ref: "Faculty"
    },
    major: {
        type: Schema.Types.ObjectId,
        ref: "Major"
    },
    enrollmentYear: {
        type: Schema.Types.ObjectId,
        ref: "EnrollmentYear",
        required: true
    }
})

const LecturerSchema = new Schema({
    faculty: {
        type: Schema.Types.ObjectId,
        ref: "Faculty"
    },
})

const CandidateSchema = new Schema({
    registeredMajor: {
        type: Schema.Types.ObjectId,
        ref: "Major"
    },
    highSchool: {
        type: String,
        required: true
    }
})

UserSchema.plugin(longTimestampsPlugin)
UserSchema.plugin(removeVersionFieldPlugin)

UserSchema.methods.toPublicData = function(timestamps = false) {
    const obj = this.toObject()
    delete obj.password
    if(!timestamps) {
        delete obj.updatedAt
        delete obj.createdAt
    }
    return obj
}

UserSchema.pre("save", async function(next) {
    if(this.isNew && !this.username || this.username === "") {
        const formattedFirstName = removeAccents(this.firstName).toLocaleLowerCase()
        const formattedLastName = removeAccents(this.lastName).toLocaleLowerCase()
        let concatenatedName = `${formattedFirstName}.${formattedLastName}`
        concatenatedName = concatenatedName.replace(/\s+/g, '')
        this.username = `${concatenatedName}@${this.identityCode}`
    }
    if(!this.isNew && !this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(config.BCRYPT.SALT)
    this.password = await bcrypt.hashSync(this.password, salt)
    next()
})

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compareSync(password, this.password)
}

UserSchema.index({email: 1}, { sparse: true, unique: true})
UserSchema.index({identityCode: 1}, {sparse: true, unique: true})
UserSchema.index({username: 'text', firstName: 'text', lastName: 'text', homeTown: 'text'})
UserSchema.pre('find', function() {
    this.populate('avatar', 'url')
})
UserSchema.pre('findOne', function() {
    this.populate('avatar', 'url')
})
UserSchema.pre('findOneAndUpdate', function() {
    this.populate('avatar', 'url')
})
UserSchema.statics.findByIdWithoutPopulateAvatar = function (query) {
    return this.findById(query)
}

const User = mongoose.model("User", UserSchema)
const CollegeStudent = mongoose.model("CollegeStudent", CollegeStudentSchema)
const Lecturer = mongoose.model("Lecturer", LecturerSchema)
const Candidate = mongoose.model("Candidate", CandidateSchema)

export {
    User,
    CollegeStudent,
    Lecturer,
    Candidate
}

