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
        existingLike = await Like.findOne({post: postId, user, userType: "User"})
    } else {
        existingLike = await Like.findOne({post: postId, userPage, userType: "UserPage"})
    }
    if (!existingLike) {
        const session = await mongoose.startSession()
        session.startTransaction()
        try {
            const likeInfo = {post: postId, userType}
            if (userType === "User") {
                likeInfo.user = user
            } else {
                likeInfo.userPage = userPage
            }
            const newLike = new Like(likeInfo)
            await newLike.save({session})
            post.likeCounts += 1
            post.likes.unshift(newLike._id)
            post.likes = post.likes.slice(0, 10)
            await post.save({session})
            await session.commitTransaction()
        } catch(e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
        }
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
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        if (userType === "User") {
            existingLike = await Like.findOneAndDelete({post: postId, user, userType: "User"}, {session})
        } else {
            existingLike = await Like.findOneAndDelete({post: postId, userPage, userType: "UserPage"}, {session})
        }
        if (!existingLike) {
            throw new NotFoundError()
        } else {
            post.likeCounts -= 1
            post.likes = post.likes.filter(id => !id.equals(existingLike._id))
            await post.save({session})
        }
        await session.commitransaction()
    } catch (e) {
        await session.abortTransaction()
        throw e
    } finally {
        await session.endSession()
    }

    return await getLikesPost(userType === "User" ? user : userPage, postId, {
        limit: 10
    })
}

const getFeedPosts = async(userId, page = 1, limit = 10) => {
    let posts = []
    let followingUsers = []
    let followingPages = []
    const currentListFollow = await Follower.findOne({user: userId})

    if(currentListFollow) {
        followingUsers = currentListFollow.following.filter(following => following.userType === 'User').map(following => following.user)
        followingPages = currentListFollow.following.filter(following => following.userType === 'UserPage').map(following => following.page)
    }
    followingUsers.push(userId)
    followingPages.push(userId)
    console.log(followingUsers)
    const skip = (page - 1) * limit
    posts = await Post.find({
        $or: [
            { userAuthor: { $in: followingUsers }},
            { userPageAuthor: { $in: followingPages }}
        ]
    })
        .populate({
            path: "likes",
            select: "userType user userPage -_id",
            populate: [
                {
                    path: "user",
                    select: "username avatar email",
                    populate: {
                        path: "avatar",
                        select: "url -_id"
                    }
                },
                {
                    path: "userPage",
                    select: "pageName avatar",
                    populate: {
                        path: "avatar",
                        select: "url -_id"
                    }
                },
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
        likeCounts: count[0] ? count[0].likeCounts : 0
    }
}


export {
    createNewPost,
    likePost,
    unlikePost,
    getLikesPost,
    getFeedPosts
}
