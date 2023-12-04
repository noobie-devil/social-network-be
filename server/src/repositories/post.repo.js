import Post from "../models/post.model.js";
import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";


const createNewPost = async(payload) => {
    try {
        payload = cleanNullAndEmptyData(payload)
        return await Post.create(payload)
    } catch (e) {
        throw e
    }
}

/**
 * Like the post
 * @param postId - The id of update post
 * @param user - The id of the user who liked the post [User or UserPage]
 * @param userType - Specify the value of userType who performed. Valid values ["User", "UserPage"]
 * @returns {Promise<*>}
 */
const likePost = async({postId, user, userType = 'User'}) => {
    const post = await Post.findById(postId)
    if(!post || post.privacyMode === 0) throw new NotFoundError()
    const existingLike = post.likes.find((like) => like.userType === userType && like.user.toString() === user)
    if(!existingLike) {
        post.likes.unshift({userType, user})
        post.likeCounts = post.likes.length
    } else {
        throw new BadRequestError()
    }
    return await post.save()
        .then(async value => {
            await value.populate([
                {
                    path: 'likes.user',
                    select: function(value) {
                        return value.userType === "User" ? "username avatar email" : "pageName avatar"
                    },
                    model: function(value) {
                        return value.userType === 'User' ? 'User' : 'UserPage'
                    }
                },
                { path: "postResources"}
            ])
        })
}

const unlikePost = async({postId, user, userType = 'User'}) => {
    const post = await Post.findById(postId)
    if(!post || post.privacyMode === 0) throw new NotFoundError()
    const existingIndex = post.likes.findIndex(
        (like) => like.userType === userType && like.user.toString() === user
    )
    if (existingIndex !== -1) {
        post.likes.splice(existingIndex, 1);
        post.likeCounts = post.likes.length;
    } else {
        throw new BadRequestError()
    }
    return await post.save()

}




const getPostById = async(postId) => {
    // const query = Post.aggregate([
    //     {
    //         $match: {
    //             _id: new mongoose.Types.ObjectId(postId)
    //         }
    //     },
    //     {
    //         $project: {
    //             likes: { $slice: ['$likes', 10]}
    //         }
    //     },
    //     {
    //         $unwind: "$likes"
    //     },
    //     {
    //         $lookup: {
    //             from: {
    //                 $cond: {
    //                     if: {$eq: ['$likes.userType', 'User']},
    //                     then: 'users',
    //                     else: 'userpages'
    //                 }
    //             },
    //             localField: 'likes.user',
    //             foreignField: '_id',
    //             as: "user"
    //         }
    //     },
    //     {
    //         $project: {
    //
    //         }
    //     }
    //
    // ])

    const post = Post.findById(postId)
        .populate({
            path: "likes",
            populate: {
                path: "user",
                select: function(doc) {
                    return doc.userType === "User" ? "username avatar email" : "pageName avatar"
                },
                model: function(doc) {
                    return doc.userType === 'User' ? 'User' : 'UserPage'
                }
            }
        });
}

export {
    createNewPost,
    likePost,
    unlikePost
}
