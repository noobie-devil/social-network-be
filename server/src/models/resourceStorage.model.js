import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

export const ResourceType = {
    IMAGE: "Image",
    VIDEO: "Video"
}

const ResourceStorageSchema = new Schema(
    {
        url: {
            type: String,
            required: true
        },
        resourceType: {
            type: String,
            required: true,
            enum: Object.values(ResourceType)
        }
    },
    {
        timestamps: true
    }
);
ResourceStorageSchema.plugin(removeVersionFieldPlugin)
ResourceStorageSchema.plugin(longTimestampsPlugin);
const ResourceStorage = mongoose.model("Image", ResourceStorageSchema);


export default ResourceStorage
