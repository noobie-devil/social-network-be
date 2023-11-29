import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const pageCategories = {
    1: {
        vi: "Văn phòng khoa",
        en: "Faculty offices"
    },
    2 :{
        vi: "Phòng ban",
        en: "Departments"
    },
    3: {
        vi: "Công ty",
        en: "Company"
    },
    4: {
        vi: 'Học tập',
        en: 'Learning',
    },
    5: {
        vi: 'Giải trí',
        en: 'Entertainment',
    },
    6: {
        vi: 'Khoa học',
        en: 'Science',
    },
    7: {
        vi: 'Câu lạc bộ',
        en: 'Clubs',
    },

};

const userTypes = ["User", "UserPage"]

const UserPageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pageName: {
        type: String,
        required: true
    },
    pageCategory: {
        type: Number,
        enum: Object.keys(pageCategories),
        required: true
    },
    description: {
        type: String
    },
    avatar: {
        type: Schema.Types.ObjectId,
        ref: "Image"
    },
    likeCounts: {
        type: Number,
        default: 0
    },
    likes: [
        {
            userType: {
                type: String,
                enum: userTypes,
                required: true
            },
            userId : {
                type: Schema.Types.ObjectId
            }
        }
    ]
})

UserPageSchema.plugin(longTimestampsPlugin)
UserPageSchema.plugin(removeVersionFieldPlugin)
const UserPage = mongoose.model("UserPage", UserPageSchema)

export default UserPage
