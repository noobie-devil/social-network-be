import {Schema} from "mongoose";

const ImageSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);
const Image = mongoose.model("Image", ImageSchema);

module.exports = {
    Image
};
