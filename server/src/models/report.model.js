import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

export const reportReasons = {
    SPAM: {
        vi: 'Quảng cáo gửi thư rác hoặc đánh lừa',
        en: 'Spam or misleading',
    },
    HATEFUL_CONTENT: {
        vi: 'Nội dung gây căm thù',
        en: 'Hateful content',
    },
    VIOLENCE: {
        vi: 'Hành vi bạo lực hoặc gây hại',
        en: 'Violence or harmful behavior',
    },
    INTELLECTUAL_PROPERTY: {
        vi: 'Xâm phạm quyền sở hữu trí tuệ của tôi',
        en: 'Infringes my intellectual property rights',
    },
    OTHER: {
        vi: 'Lý do khác',
        en: 'Other',
    },
};

const ReportSchema = new Schema({
    reporter: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    reason: {
        type: String,
        enum: Object.keys(reportReasons),
        required: true
    },
    details: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    }
},{
    timestamps: true
})

ReportSchema.plugin(longTimestampsPlugin)
ReportSchema.plugin(removeVersionFieldPlugin)
const Report = mongoose.model("Report", ReportSchema)
export default Report
