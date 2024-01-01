import Post, {requiredPopulatedObject} from "../models/post.model.js";
import {cleanData, cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import Like from "../models/like.model.js";
import Follower from "../models/follower.model.js";
import {deleteAssetResourceWithRef} from "../services/assetResource.service.js";
import ResourceStorage from "../models/resourceStorage.model.js";
import {User} from "../models/user.model.js";


const createNewPost = async (payload) => {
    try {
        payload = cleanNullAndEmptyData(payload)
        let createdPost = await Post.create(payload)
        createdPost = await createdPost
            .populate(requiredPopulatedObject)
        createdPost = createdPost.toObject()
        if(createdPost.userAuthor) {
            createdPost.userAuthor.fullName = createdPost.userAuthor.firstName + " " + createdPost.userAuthor.lastName
            createdPost.userAuthor.avatar = createdPost.userAuthor.avatar ? createdPost.userAuthor.avatar.url : ""
        }
        if(createdPost.userPageAuthor) {
            createdPost.userPageAuthor.avatar = createdPost.userPageAuthor.avatar ? createdPost.userPageAuthor.avatar.url : ""
        }
        if(createdPost.userAuthor) {
            delete createdPost.userAuthor.firstName
            delete createdPost.userAuthor.lastName
        }
        return createdPost

    } catch (e) {
        throw e
    }
}
/* Fixing */
const getPostById = async (postId) => {
    const post = await Post.findById(postId)
        .populate(requiredPopulatedObject)
    // if (!post) throw new NotFoundError()
    // if(post.userAuthor) {
    //     post.userAuthor.fullName = post.userAuthor.firstName + " " + post.userAuthor.lastName
    //     post.userAuthor.avatar = post.userAuthor.avatar ? post.userAuthor.avatar.url : ""
    // }
    // if(post.userPageAuthor) {
    //     post.userPageAuthor.avatar = post.userPageAuthor.avatar ? post.userPageAuthor.avatar.url : ""
    // }
    // const formattedObject = post.toObject()
    // if(post.userAuthor) {
    //     delete post.userAuthor.firstName
    //     delete post.userAuthor.lastName
    // }
    return post
}

const updatePost = async (postId, payload) => {
    payload = cleanData(payload)
    console.log(payload)
    const post = await Post.findById(postId)
    if (!post) throw new NotFoundError()
    const invalidCondition = (!payload.postResources || payload.postResources.length === 0) && (!payload.content || payload.content.toString() === '')

    if (!post.postResources || post.postResources.length === 0 || !post.content || post.content === '') {
        if (invalidCondition) {
            throw new BadRequestError()
        }
    }
    const removedResources = []
    if (payload) {
        if (payload.postResources) {
            removedResources.push(...
                post.postResources.filter(resource => !payload.postResources.includes(resource._id.toString()))
                    .map(resource => resource._id)
            )
            console.log("postResources: " + removedResources)
        }
        const session = await mongoose.startSession()
        await session.startTransaction()
        try {
            if (payload.content !== undefined) {
                post.content = payload.content
            }
            if (payload.postResources) {
                const attachmentChanges = removedResources.length !== 0 || (post.postResources && payload.postResources.length !== post.postResources.length)
                if (attachmentChanges) {
                    post.postResources = await ResourceStorage.find({
                        _id: {$in: payload.postResources}
                    }).select("url resourceType")
                }
            }
            await post.save({new: true, session})
            await session.commitTransaction()
            if (removedResources.length !== 0) {
                deleteAssetResourceWithRef({
                    resources: removedResources
                })
            }
            return {
                content: post.content,
                postResources: post.postResources,
                updatedAt: post.updatedAt
            }
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
        }
    } else {
        throw new BadRequestError()
    }

}

const deletePost = async (postId) => {
    const post = await Post.findById(postId)
    if (!post) throw new NotFoundError()
    const removedResources = []
    if (post.postResources) {
        removedResources.push(...post.postResources)
    }
    const session = await mongoose.startSession()
    await session.startTransaction()
    try {
        await Like.deleteMany({post: postId}, {session})
        await post.deleteOne({session})
        await session.commitTransaction()
        if (removedResources && removedResources.length !== 0) {
            deleteAssetResourceWithRef({
                resources: removedResources
            })
        }
        return "Delete success"
    } catch (e) {
        await session.abortTransaction()
        throw e
    } finally {
        await session.endSession()
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
    if(!post || (post.privacyMode === 0 && post.userAuthor !== user._id)) throw new NotFoundError()
    // if (!post || post.privacyMode === 0) throw new NotFoundError()
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
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
        }
    } else {
        throw new BadRequestError()
    }
    return post.likeCounts
    // return await getLikesPost(userType === "User" ? user : userPage, postId, {
    //     limit: 10
    // })
}

const unlikePost = async ({postId, user, userPage, userType = 'User'}) => {
    const post = await Post.findById(postId)
    if(!post || (post.privacyMode === 0 && post.userAuthor !== user._id)) throw new NotFoundError("Not found the post")
    let existingLike = null
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        if (userType === "User") {
            existingLike = await Like.findOneAndDelete({post: postId, user: user._id, userType: "User"}, {session})
        } else {
            existingLike = await Like.findOneAndDelete({post: postId, userPage, userType: "UserPage"}, {session})
        }
        if (!existingLike) {
            throw new BadRequestError("The user has not liked the post")
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
    return post.likeCounts

    // return await getLikesPost(userType === "User" ? user : userPage, postId, {
    //     limit: 10
    // })
}

const getUserPosts = async ({currentUser, userId, page = 1, limit = 10}) => {
    let friendIds = currentUser.friends
    const skip = (page - 1) * limit
    const query = [
        {
            $and: [
                { userAuthor: new mongoose.Types.ObjectId(userId)  },
                { privacyMode: 1}
            ]
        }
    ]
    if(userId === currentUser._id.toString()) {
        query.push(
            {
                $and: [
                    { userAuthor: new mongoose.Types.ObjectId(userId)  },
                    { privacyMode: 0 }
                ]
            }
        )
    }
    if(friendIds.includes(userId)) {
        query.push(
            {
                $and: [
                    { userAuthor: new mongoose.Types.ObjectId(userId)  },
                    { privacyMode: 2 }
                ]
            }
        )
    }
    friendIds = [currentUser._id, ...friendIds]
    const posts = await Post.aggregate([
        {
            $match: {
                $or: query
            }
        },
        { $sort: { updatedAt: -1} },
        { $skip: parseInt(skip, 10), },
        { $limit: parseInt(limit, 10), },
        {
            $lookup: {
                from: "resourcestorages",
                let: { postResources: "$postResources" },
                as: "postResources",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$postResources"]
                            }
                        }
                    },
                    {
                        $project: {
                            url: "$url",
                            resourceType: "$resourceType"
                        }
                    },
                ]
            }
        },
        {
            $lookup: {
                from: "userpages",
                localField: "userPageAuthor",
                foreignField: "_id",
                let: {i: "$userPage"},
                pipeline: [
                    {
                        $lookup: {
                            from: "resourcestorages",
                            localField: "avatar",
                            foreignField: "_id",
                            as: "avatar"
                        }
                    },
                    {
                        $project: {
                            pageName: "$pageName",
                            pageId: "$_id" ,
                            avatar: {
                                $ifNull: [{$first: "$avatar.url"}, ""]
                            }
                        }
                    },
                ],
                as: "userPageAuthor"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userAuthor",
                foreignField: "_id",
                let: {i: "$user"},
                pipeline: [
                    {
                        $lookup: {
                            from: "resourcestorages",
                            localField: "avatar",
                            foreignField: "_id",
                            as: "avatar"
                        }
                    },
                    {
                        $project: {
                            fullName: {
                                $concat: [
                                    "$firstName",
                                    " ",
                                    "$lastName",
                                ]
                            },
                            userId: "$_id" ,
                            username: "$username",
                            avatar: {
                                $ifNull: [{$first: "$avatar.url"}, ""]
                            }
                        }
                    },
                ],
                as: "userAuthor",
            },
        },
        {
            $lookup: {
                from: "likes",
                let: { postId: "$_id", friendIds},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$post", "$$postId"] },
                                    { $in: ["$user", friendIds]}
                                ]
                            }
                        }
                    },
                    {
                        $addFields: {
                            indexInFriendIds: {
                                $indexOfArray: [friendIds, "$user"]
                            }
                        }
                    },
                    {
                        $sort: {
                            indexInFriendIds: 1
                        }
                    },
                    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user"} },
                    {
                        $project: {
                            fullName: {
                                $concat: [
                                    { $first: "$user.firstName" },
                                    " ",
                                    { $first: "$user.lastName" },
                                ]
                            },
                            userId: { $first: "$user._id" },
                            isFriend: { $ne: [ { $first: "$user._id" }, currentUser._id] }
                        }
                    },
                    {
                        $limit: 2
                    },
                    {
                        $unset: "indexInFriendIds"
                    }
                ],
                as: "likes"
            }
        },
        {
            $set: {
                userAuthor: {
                    $ifNull: [{$first: "$userAuthor"}, {}],
                },
                userPageAuthor: {
                    $ifNull: [{$first: "$userPageAuthor"}, {}],
                }
            }
        }
    ])
    // const posts = await Post.find({
    //     $or: [
    //         {userAuthor: {$in: userId}},
    //         {userPageAuthor: {$in: userId}}
    //     ],
    //     privacyMode: 1
    // })
    //     .sort({updatedAt: -1})
    //     .skip(skip)
    //     .limit(limit)
    //     .exec()
    return {
        posts
    }
}

const getRelatesLikePost = async ({user, postId, page = 1, limit = 10}) => {
    const originLimit = limit
    let skip = (page - 1) * originLimit
    // const user = await User.findById(userId)
    //     .select("-_id friends")
    const filterIds = [user._id,...user.friends]
    console.log(filterIds)
    const baseQuery = [
        { $sort: { createdAt: -1 } },
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user"} },
        {
            $project: {
                username: {
                    $ifNull: [{$first: "$user.username"}, ""],
                },
                fullName: {
                    $concat: [
                        { $first: "$user.firstName" },
                        " ",
                        { $first: "$user.lastName" },
                    ]
                },
                avatarUrl: {
                    $ifNull: [{$first: "$user.avatar.url"}, ""],
                },
                userId: { $first: "$user._id" },
                postId: postId
            }
        }
    ]
    const queryFindRelate = {
        user: { $in: filterIds},
        post: new mongoose.Types.ObjectId(postId)
    }
    let count = await Like.aggregate([
        { $match: queryFindRelate},
        { $count: "count"}
    ])
    count = count.length > 0 ? count[0].count : 0
    console.log(count)
    const compensation = count - limit
    let likes = []
    limit = skip - compensation
    if(limit <= 0) {
        likes = await Like.aggregate([
            { $match: queryFindRelate },
            { $skip: 0 },
            { $limit: parseInt(originLimit, 10), },
            ...baseQuery,
            {
                $addFields: {
                    indexInFilterIds: {
                        $indexOfArray: [filterIds, "$userId"]
                    }
                }
            },
            {
                $sort: {
                    indexInFilterIds: 1
                }
            },
            {
                $unset: "indexInFilterIds"
            },
            {
                $addFields: {
                    isFriend: true
                }
            },
        ])
        console.log(likes)
        if(likes.length < originLimit) {
            const additionalLikes = await Like.aggregate([
                { $match: { post: new mongoose.Types.ObjectId(postId), user: { $nin: filterIds } } },
                { $skip: 0 },
                { $limit: parseInt(originLimit - likes.length, 10) },
                ...baseQuery,
                {
                    $addFields: {
                        isFriend: false
                    }
                }
            ])
            likes.push(...additionalLikes)
        }
    } else {
        let byPassed = 0
        if(count > skip) {
            byPassed = count - skip
            if(byPassed > 0) {
                likes = await Like.aggregate([
                    { $match: queryFindRelate },
                    { $skip: parseInt(skip, 10), },
                    { $limit: parseInt(byPassed, 10),},
                    ...baseQuery,
                    {
                        $addFields: {
                            indexInFilterIds: {
                                $indexOfArray: [filterIds, "$userId"]
                            }
                        }
                    },
                    {
                        $sort: {
                            indexInFilterIds: 1
                        }
                    },
                    {
                        $unset: "indexInFilterIds"
                    },
                    {
                        $addFields: {
                            isFriend: true
                        }
                    }
                ])
            }
        }
        if(limit < originLimit) {
            skip = 0
        } else {
            skip = skip - count
        }
        const additionalLikes = await Like.aggregate([
            { $match: { post: new mongoose.Types.ObjectId(postId), user: { $nin: filterIds } } },
            { $skip: parseInt(skip, 10), },
            { $limit: parseInt(originLimit - byPassed, 10)},
            ...baseQuery,
            {
                $addFields: {
                    isFriend: false
                }
            },
        ])
        likes.push(...additionalLikes)
    }
    const likeCounts = count + (await Like.countDocuments({ post: new mongoose.Types.ObjectId(postId), user: { $nin: filterIds}}))
    return {
        likes,
        likeCounts
    }

}
const getFeedPosts = async({user, page = 1, limit = 10}) => {
    let friendIds = user.friends

    const currentListFollow = await Follower.aggregate([
        { $match: { user: user._id } },
        {
            $project: {
                followingUsers: {
                    $filter: {
                        input: "$following",
                        as: "follow",
                        cond: { $eq: ["$$follow.userType", "User"] }
                    }
                },
                followingPages: {
                    $filter: {
                        input: "$following",
                        as: "follow",
                        cond: { $eq: ["$$follow.userType", "UserPage"] }
                    }
                },

            }
        }
    ])
    let followingUsers = []
    let followingPages = []
    if (currentListFollow.length > 0) {
        followingUsers = currentListFollow[0].followingUsers.map(follow => follow.user);
        followingPages = currentListFollow[0].followingPages.map(follow => follow.page);
    }
    followingUsers.push(user._id)
    followingPages.push(user._id)
    followingUsers = Array.from(new Set([...friendIds, ...followingUsers]))
    const skip = (page - 1) * limit
    const posts = await Post.aggregate([
        {
            $match: {
                $or: [
                    { userAuthor: { $in: followingUsers } },
                    { userPageAuthor: { $in: followingPages } }
                ],
                privacyMode: 1
            }
        },
        { $sort: { updatedAt: -1} },
        { $skip: parseInt(skip, 10), },
        { $limit: parseInt(limit, 10), },
        {
            $lookup: {
                from: "resourcestorages",
                let: { postResources: "$postResources" },
                as: "postResources",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$postResources"]
                            }
                        }
                    },
                    {
                        $project: {
                            url: "$url",
                            resourceType: "$resourceType"
                        }
                    },
                ]
            }
        },
        {
          $lookup: {
              from: "userpages",
              localField: "userPageAuthor",
              foreignField: "_id",
              let: {i: "$userPage"},
              pipeline: [
                  {
                      $lookup: {
                          from: "resourcestorages",
                          localField: "avatar",
                          foreignField: "_id",
                          as: "avatar"
                      }
                  },
                  {
                      $project: {
                          pageName: "$pageName",
                          pageId: "$_id" ,
                          avatar: {
                              $ifNull: [{$first: "$avatar.url"}, ""]
                          }
                      }
                  },
              ],
              as: "userPageAuthor"
          }
        },
        {
            $lookup: {
                from: "users",
                localField: "userAuthor",
                foreignField: "_id",
                let: {i: "$user"},
                pipeline: [
                    {
                        $lookup: {
                            from: "resourcestorages",
                            localField: "avatar",
                            foreignField: "_id",
                            as: "avatar"
                        }
                    },
                    {
                        $project: {
                            fullName: {
                                $concat: [
                                    "$firstName",
                                    " ",
                                    "$lastName",
                                ]
                            },
                            userId: "$_id" ,
                            username: "$username",
                            avatar: {
                                $ifNull: [{$first: "$avatar.url"}, ""]
                            }
                        }
                    },
                ],
                as: "userAuthor",
            },
        },
        {
            $lookup: {
                from: "likes",
                let: { postId: "$_id", friendIds},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$post", "$$postId"] },
                                    { $in: ["$user", friendIds]}
                                ]
                            }
                        }
                    },
                    {
                        $addFields: {
                            indexInFriendIds: {
                                $indexOfArray: [friendIds, "$user"]
                            }
                        }
                    },
                    {
                        $sort: {
                            indexInFriendIds: 1
                        }
                    },
                    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user"} },
                    {
                        $project: {
                            fullName: {
                                $concat: [
                                    { $first: "$user.firstName" },
                                    " ",
                                    { $first: "$user.lastName" },
                                ]
                            },
                            userId: { $first: "$user._id" },
                            isFriend: { $ne: [ { $first: "$user._id" }, user._id] }
                        }
                    },
                    {
                        $limit: 2
                    },
                    {
                        $unset: "indexInFriendIds"
                    }
                ],
                as: "likes"
            }
        },
        {
            $set: {
                userAuthor: {
                    $ifNull: [{$first: "$userAuthor"}, {}],
                },
                userPageAuthor: {
                    $ifNull: [{$first: "$userPageAuthor"}, {}],
                }
            }
        }
    ])
    // const posts = await Post.find({
    //     $or: [
    //         {userAuthor: {$in: followingUsers}},
    //         {userPageAuthor: {$in: followingPages}}
    //     ],
    //     privacyMode: 1
    // })
    //     .sort({updatedAt: -1})
    //     .skip(skip)
    //     .limit(limit)
    //     .exec()
    return {
        posts
    }

}
// const getFeedPosts = async (userId, {page = 1, limit = 10}) => {
//     let followingUsers = []
//     let followingPages = []
//
//     const currentListFollow = await Follower.findOne({user: userId})
//     if (currentListFollow) {
//         followingUsers = currentListFollow.following.filter(following => following.userType === 'User').map(following => following.user)
//         followingPages = currentListFollow.following.filter(following => following.userType === 'UserPage').map(following => following.page)
//     }
//
//
//     followingUsers.push(userId)
//     followingPages.push(userId)
//     const skip = (page - 1) * limit
//     const posts = await Post.find({
//         $or: [
//             {userAuthor: {$in: followingUsers}},
//             {userPageAuthor: {$in: followingPages}}
//         ],
//         privacyMode: 1
//     })
//         .sort({updatedAt: -1})
//         .skip(skip)
//         .limit(limit)
//         .exec()
//
//     return {
//         posts
//     }
// }

const getLikesPost = async (currentActorId, postId, {search = "", limit = 20, page = 1}) => {
    const skip = (page - 1) * limit
    const post = await Post.findById(postId)
    if (!post || post.privacyMode === 0) {
        if (post && (post.userAuthor && post.userAuthor.toString() === currentActorId.toString() || post.userPageAuthor && post.userPageAuthor.toString() === currentActorId.toString())) {

        } else {
            throw new NotFoundError()
        }
    }
    const aggregateQuery = [
        {$match: {post: new mongoose.Types.ObjectId(postId)}},
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
        {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
        {$unwind: {path: '$userPage', preserveNullAndEmptyArrays: true}},
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
        {$unwind: {path: '$user.avatar', preserveNullAndEmptyArrays: true}},
        {$unwind: {path: '$userPage.avatar', preserveNullAndEmptyArrays: true}},
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
                'user': {$cond: [{$eq: ['$user', {}]}, "$$REMOVE", "$user"]},
                'userPage': {$cond: [{$eq: ['$userPage', {}]}, "$$REMOVE", "$userPage"]},
                'userType': 1,
                'post': 1,
                'createdAt': 1,
                'updatedAt': 1,
            }
        }
    ]
    const count = await Like.aggregate([...aggregateQuery, {$count: "likeCounts"}])
    const likes = await Like.aggregate([...aggregateQuery, {$skip: parseInt(skip, 10)}, {$limit: parseInt(limit, 10)}])
    return {
        likes,
        likeCounts: count[0] ? count[0].likeCounts : 0
    }
}


export {
    getPostById,
    createNewPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    getLikesPost,
    getFeedPosts,
    getUserPosts,
    getRelatesLikePost
}
