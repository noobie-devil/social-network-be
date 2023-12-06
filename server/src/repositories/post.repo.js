import Post from "../models/post.model.js";
import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import Like from "../models/like.model.js";
import Follower from "../models/follower.model.js";


const createNewPost = async (payload) => {
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
const likePost = async ({postId, user, userPage, userType = 'User'}) => {
    const post = await Post.findById(postId)
    if (!post || post.privacyMode === 0) throw new NotFoundError()
    let existingLike = null
    if (userType === "User") {
        existingLike = await Like.findOne({postId, user, userType: "User"})
    } else {
        existingLike = await Like.findOne({postId, userPage, userType: "UserPage"})
    }
    if (!existingLike) {
        const likeInfo = {post: postId, userType}
        if (userType === "User") {
            likeInfo.user = user
        } else {
            likeInfo.userPage = userPage
        }
        const newLike = new Like(likeInfo)
        await newLike.save()
        post.likeCounts += 1
        await post.save()
    } else {
        throw new BadRequestError()
    }
    return await getLikesPost(userType === "User" ? user : userPage, postId, {
        limit: 10
    })
}

const unlikePost = async ({postId, user, userPage, userType = 'User'}) => {
    const post = await Post.findById(postId)
    if (!post || post.privacyMode === 0) throw new NotFoundError()
    let existingLike = null
    if (userType === "User") {
        existingLike = await Like.findOneAndDelete({postId, user, userType: "User"})
    } else {
        existingLike = await Like.findOneAndDelete({postId, userPage, userType: "UserPage"})
    }
    if (!existingLike) {
        throw new NotFoundError()
    } else {
        post.likeCounts -= 1
        await post.save()
    }
    return await getLikesPost(userType === "User" ? user : userPage, postId, {
        limit: 10
    })
}

const getFeedPosts = async(userId, page = 1, limit = 10) => {
    let posts = []
    const currentListFollow = await Follower.findOne({user: userId})
    if(!currentListFollow) {
        return posts
    }
    const followingUsers = currentListFollow.following.filter(following => following.userType === 'User').map(following => following.user)
    const followingPages = currentListFollow.following.filter(following => following.userType === 'UserPage').map(following => following.page)
    const skip = (page - 1) * limit
    posts = await Post.find({
        $or: [
            { userAuthor: { $in: followingUsers }},
            { userPageAuthor: { $in: followingPages }}
        ]
    })
        .sort({updatedAt: -1})
        .skip(skip)
        .limit(limit)
    return posts
}

const getLikesPost = async (currentActorId, postId, {search = "", limit = 20, page = 1}) => {
    const skip = (page - 1) * limit
    const post = await Post.findById(postId)
    if(!post || post.privacyMode === 0) {
        if(post && post.userAuthor && post.userAuthor.toString() === currentActorId.toString() || post.userPageAuthor && post.userPageAuthor.toString() === currentActorId.toString()) {

        } else {
            throw new NotFoundError()
        }
    }
    const aggregateQuery = [
        {$match: { post: new mongoose.Types.ObjectId(postId)}},
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $lookup: {
                from: 'userpages',
                localField: 'userPage',
                foreignField: '_id',
                as: 'userPage'
            }
        },
        {$unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {$unwind: { path: '$userPage', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'resourcestorages',
                localField: 'user.avatar',
                foreignField: '_id',
                as: 'user.avatar'
            }
        },
        {
            $lookup: {
                from: 'resourcestorages',
                localField: 'userPage.avatar',
                foreignField: '_id',
                as: 'userPage.avatar'
            }
        },
        { $unwind: { path: '$user.avatar', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$userPage.avatar', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                'user.username': 1,
                'user.email': 1,
                'user.avatar.url': 1,
                'userPage.pageName': 1,
                'userPage.avatar.url': 1,
            }
        },
        {
            $match: {
                $or: [
                    {'user.username': {$regex: search, $options: 'i'}},
                    {'userPage.pageName': {$regex: search, $options: 'i'}}
                ]
            }
        },
        {
            $project: {
                'user': { $cond: [{ $eq: ['$user', {}]}, "$$REMOVE", "$user"]},
                'userPage': { $cond: [{ $eq: ['$userPage', {}]}, "$$REMOVE", "$userPage"]},
                'userType': 1,
                'post': 1,
                'createdAt': 1,
                'updatedAt': 1,
            }
        }
    ]
    const count = await Like.aggregate([...aggregateQuery, { $count: "likeCounts" }])
    const likes = await Like.aggregate([...aggregateQuery, { $skip: parseInt(skip, 10) }, { $limit: parseInt(limit, 10) }])
    return {
        likes,
        likeCounts: count[0].likeCounts
    }
}


export {
    createNewPost,
    likePost,
    unlikePost,
    getLikesPost
}
