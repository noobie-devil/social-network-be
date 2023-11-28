import mongoose, {Schema} from "mongoose"

const EnrollmentYearSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    startYear: {
        type: Number,
        required: true,
        unique: true
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

EnrollmentYearSchema.index({startYear: 1});
EnrollmentYearSchema.index({name: 'text'});
const EnrollmentYear = mongoose.model('EnrollmentYear', EnrollmentYearSchema)

export default EnrollmentYear
