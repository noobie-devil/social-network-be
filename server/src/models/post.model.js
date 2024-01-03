import mongoose, {Schema} from "mongoose";
import {longTimestampsPlugin, removeVersionFieldPlugin} from "../database/plugins.js";

const PostSchema = new Schema(
    {
        userAuthor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        userPageAuthor: {
            type: Schema.Types.ObjectId,
            ref: "UserPage",
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
        },
        content: {
            type: String,
        },
        postResources: [
            {
                type: Schema.Types.ObjectId,
                ref: "ResourceStorage"
            }
        ],
        likeCounts: {
            type: Number,
            default: 0
        },
        commentCounts: {
            type: Number,
            default: 0
        },
        // likes: [
        //     {
        //         type: Schema.Types.ObjectId,
        //         ref: "Like"
        //     }
        // ],
        sharedPost: {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        },
        privacyMode: {
            type: Number,
            enum: [0, 1, 2],
            default: 1
        },
        tags: [
            {type: String}
        ],
        shares: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);
PostSchema.plugin(removeVersionFieldPlugin)
PostSchema.plugin(longTimestampsPlugin);


export const requiredPopulatedObject = [
    {
      path: "userAuthor",
      select: "username firstName lastName avatar",
    },
    {
      path: "userPageAuthor",
      select: "pageName avatar",
      populate: [
          {
              path: "avatar",
              select: "url"
          }
      ]
    },
    // {
    //     path: "likes",
    //     select: "userType user userPage -_id",
    //     populate: [
    //         {
    //             path: "user",
    //             select: "username avatar email",
    //             populate: {
    //                 path: "avatar",
    //                 select: "url -_id"
    //             }
    //         },
    //         {
    //             path: "userPage",
    //             select: "pageName avatar",
    //             populate: {
    //                 path: "avatar",
    //                 select: "url -_id"
    //             }
    //         },
    //     ]
    // },
    {
        path: "postResources",
        select: "url resourceType"
    }
]

// PostSchema.pre('find', function() {
//     this.populate(requiredPopulatedObject)
// })
// PostSchema.pre('findOne', function() {
//     this.populate(requiredPopulatedObject)
// })
// PostSchema.pre('findOneAndUpdate', function() {
//     this.populate(requiredPopulatedObject)
// })

// PostSchema.post('save', async function(doc, next) {
//     console.log(doc)
//     await doc.populate(requiredPopulatedObject)
//     console.log(doc)
//     next()
// })
PostSchema.index({user: 1, group: 1, createdAt: -1}, {
    sparse: true,
    unique: true
});
const Post = mongoose.model('Post', PostSchema);

export default Post
