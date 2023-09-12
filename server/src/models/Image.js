import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin} from "../database/plugins.js";

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

ImageSchema.plugin(longTimestampsPlugin);
const Image = mongoose.model("Image", ImageSchema);

module.exports = {
    Image
};
