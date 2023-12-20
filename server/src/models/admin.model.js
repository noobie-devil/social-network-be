import mongoose, {Schema} from "mongoose";
import {ForbiddenError} from "../core/errors/forbidden.error.js";
import bcrypt from "bcrypt";
import global_config from "../utils/global.config.js";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const AdminSchema = new Schema({
    username: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    avatar: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ['sysAdmin', 'admin'],
        required: true,
        default: 'admin'
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'AdminGroup'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }
},{
    timestamps: true
})

AdminSchema.plugin(longTimestampsPlugin)
AdminSchema.plugin(removeVersionFieldPlugin)

AdminSchema.methods.toPublicData = function(timestamps = false) {
    const obj = this.toObject()
    delete obj.password
    if(!timestamps) {
        delete obj.updatedAt
        delete obj.createdAt
    }
    return obj
}

export const adminFieldPopulated = [
    {
        path: "avatar",
        select: "url"
    },
    {
        path: "createdBy",
        select: "username -_id"
    },
    {
        path: "updatedBy",
        select: "username -_id"
    },
    {
        path: "group",
        select: "groupName"
    }
]

// AdminSchema.pre('find', function() {
//     this.populate(adminFieldPopulated)
// })
// AdminSchema.pre('findOne', function() {
//     this.populate(adminFieldPopulated)
// })
// AdminSchema.pre('findOneAndUpdate', function() {
//     this.populate(adminFieldPopulated)
// })
AdminSchema.pre('save', async function(next) {
    if(this.isNew && !this.username || this.username === "") {
        const emailSplit = this.email.split('@');
        this.username = emailSplit[0]
    }
    if(!this.isNew && !this.isModified('password')) {

    } else {
        const salt = await bcrypt.genSalt(global_config.BCRYPT.SALT)
        this.password = await bcrypt.hashSync(this.password, salt)
    }

    if(!this.isNew && this.isModified('type') && this.type === 'sysAdmin') {
        throw new ForbiddenError("Permission denied. You do not have the authority")
    }
    next()
})
AdminSchema.methods.comparePassword = async function(password) {
    console.log(password)
    console.log(this)
    console.log(this.password)
    return await bcrypt.compareSync(password, this.password)
}

const AdminGroupSchema = new Schema({
    groupName: {
        type: String,
        required: true,
        unique: true
    },
    admins: [
        {
            type: Schema.Types.ObjectId,
            ref: "Admin"
        }
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }
},{
    timestamps: true
})

AdminGroupSchema.plugin(longTimestampsPlugin)
AdminGroupSchema.plugin(removeVersionFieldPlugin)

const adminGroupFieldPopulated = [
    {
        path: "createdBy",
        select: "username -_id"
    },
    {
        path: "updatedBy",
        select: "username -_id"
    }
]

AdminGroupSchema.pre('find', function() {
    // this.populate(adminGroupFieldPopulated)
})
AdminGroupSchema.pre('findOne', function() {
    // this.populate(adminGroupFieldPopulated)
})
AdminGroupSchema.pre('findOneAndUpdate', function() {
    // this.populate(adminGroupFieldPopulated)
})

const Admin = mongoose.model("Admin", AdminSchema)
const AdminGroup = mongoose.model("AdminGroup", AdminGroupSchema)


export {
    Admin,
    AdminGroup
}

