import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";


const ResourceSchema = new Schema({
    resourceName: {
        type: String,
        required: true,
        unique: true
    },
    othersPermission: {
        type: Number,
        default: 4,
        enum: [0, 1, 2, 3, 4, 5, 6, 7]
    },
    permissions: [
        {
            type: Schema.Types.ObjectId,
            ref: "ResourcePermission"
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
}, {
    timestamps: true
})

ResourceSchema.plugin(longTimestampsPlugin)
ResourceSchema.plugin(removeVersionFieldPlugin)
ResourceSchema.index({resourceName: 1}, {unique: true})



const ResourcePermissionSchema = new Schema({
    resource: {
        type: Schema.Types.ObjectId,
        ref: "Resource"
    },
    actor: {
        type: Schema.Types.ObjectId,
    },
    actorType: {
        type: String,
        enum: ["Admin", "AdminGroup"]
    },
    operation: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6, 7],
        default: 6
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }
}, {
    timestamps: true
})

ResourcePermissionSchema.plugin(longTimestampsPlugin)
ResourcePermissionSchema.plugin(removeVersionFieldPlugin)
// ResourcePermissionSchema.index({resource: 1, group: 1}, {sparse: true, unique: true})
// ResourcePermissionSchema.index({resource: 1, user: 1}, {sparse: true, unique: true})
ResourcePermissionSchema.index({resource: 1, actor: 1}, {sparse: true, unique: true})

const Resource = mongoose.model("Resource", ResourceSchema)
const ResourcePermission = mongoose.model("ResourcePermission", ResourcePermissionSchema)

export {
    Resource,
    ResourcePermission
}
