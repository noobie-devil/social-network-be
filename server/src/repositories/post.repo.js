import Post from "../models/post.model.js";
import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";


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
 * @param userPage - The id of user page who liked the post
 * @param userType - Specify the value of userType who performed. Valid values ["User", "UserPage"]
 * @returns {Promise<*>}
 */
const likePost = async({postId, user, userPage, userType = 'User'}) => {
    const post = await Post.findById(postId)
    if(!post || post.privacyMode === 0) throw new NotFoundError()
    let existingLike = null
    if(userType === "User") {
        console.log(post.likes)
        existingLike = await post.likes.find(like => like.userType === "User" && like.user && like.user.toString() === user)
    } else {
        existingLike = await post.likes.find(like => like.userType === "UserPage" && like.userPage && like.userPage.toString() === userPage.toString())
    }
    if(!existingLike) {
        const likeInfo = { userType}
        if(userType === "User") {
            likeInfo.user = user
        } else {
            likeInfo.userPage = userPage
        }
        post.likes.unshift(likeInfo)
        post.likeCounts = post.likes.length
    } else {
        throw new BadRequestError()
    }
    return await returnLikeActionRes(post)
}

const unlikePost = async({postId, user, userPage, userType = 'User'}) => {
    const post = await Post.findById(postId)
    if(!post || post.privacyMode === 0) throw new NotFoundError()
    let existingIndex = null
    if(userType === "User") {
        existingIndex = post.likes.findIndex(like => like.userType === "User" && like.user && like.user.toString() === user.toString())
    } else {
        existingIndex = post.likes.findIndex(like => like.userType === "UserPage" && like.userPage && like.userPage.toString() === userPage.toString())
    }
    if(existingIndex !== -1) {
        const likeInfo = { userType}
        if(userType === "User") {
            likeInfo.user = user
        } else {
            likeInfo.userPage = userPage
        }
        post.likes.splice(existingIndex, 1);
        post.likeCounts = post.likes.length
    } else {
        throw new BadRequestError()
    }

    return await returnLikeActionRes(post)
}

const returnLikeActionRes = async (post) => {
    return await post.save()
        .then(async value => {
            value.likes = value.likes.slice(0, 20)
            await value.populate([
                {path: 'likes.user', model: 'User', select: 'username email avatar'},
                {path: 'likes.userPage', model: 'UserPage', select: 'pageName avatar'},
                {path: 'postResources'},
                {path: 'likes.user.avatar', model: "ResourceStorage"},
                {path: 'likes.userPage.avatar', model: "ResourceStorage"}
            ])
            const { _id, likes, likeCounts } = value.toObject()
            return {
                _id, likes, likeCounts
            }
        })
}

const getPostById = async(postId) => {
    const post = await Post.findById(postId)
    if(!post) throw new NotFoundError()
    return post
}

const getLikesPost = async(currentActorId, postId, {search = "", limit = 20, page = 1}) => {
    const post = getPostById(postId)
    const skip = (page - 1) * limit

    const likes = await Post.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(postId) }},
        {
            $match: {
                $or: [
                    { privacyMode: { $ne: 0}},
                    { userAuthor: new mongoose.Types.ObjectId(currentActorId) },
                    { userPageAuthor: new mongoose.Types.ObjectId(currentActorId) }
                ]
            }
        },
        {
            $project: {
                likes: 1,
                _id: 0,
                likeCounts: 1
            }
        },
        {
            $unwind: "$likes"
        },
        { $skip: parseInt(skip, 10) },
        { $limit: parseInt(limit, 10) },
        {
            $match: {
                $or: [
                    { 'likes.userType': 'User', 'likes.user': { $exists: true } }, // Filter User likes
                    { 'likes.userType': 'UserPage', 'likes.userPage': { $exists: true } }, // Filter UserPage likes
                ],
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'likes.user',
                foreignField: '_id',
                as: 'likes.user',
            },
        },
        {
            $lookup: {
                from: 'userpages',
                localField: 'likes.userPage',
                foreignField: '_id',
                as: 'likes.userPage',
            },
        },
        {
            $lookup: {
                from: 'resourcestorages',
                localField: 'likes.user.avatar',
                foreignField: '_id',
                as: 'likes.user.avatar',
            },
        },
        {
            $lookup: {
                from: 'resourcestorages',
                localField: 'likes.userPage.avatar',
                foreignField: '_id',
                as: 'likes.userPage.avatar',
            },
        },
        {
            $match: {
                $or: [
                    { 'likes.user.username': { $regex: new RegExp(search, 'i') } }, // Search in User likes
                    { 'likes.userPage.pageName': { $regex: new RegExp(search, 'i') } }, // Search in UserPage likes
                ],
            },
        },
    ])
    return likes
}



export {
    createNewPost,
    likePost,
    unlikePost,
    getLikesPost
}
