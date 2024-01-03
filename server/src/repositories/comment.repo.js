import {cleanNullAndEmptyData} from "../utils/lodash.utils.js";
import Comment, {requiredPopulatedComment} from "../models/comment.model.js";
import Post from "../models/post.model.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import mongoose from "mongoose";


const sendComment = async (user, payload) => {
    payload = cleanNullAndEmptyData(payload)
    const post = await Post.findById(payload.post)
    if(!post || (post.privacyMode === 0 && post.userAuthor !== user._id)) throw new NotFoundError()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        let sentComment = new Comment(payload)
        await sentComment.save({session})
            .then(async value => {
                await value.populate(requiredPopulatedComment)
                const valueObject = value.toObject()
                if(valueObject.user) {
                    valueObject.fullName = valueObject.user.firstName + " " + valueObject.user.lastName
                    valueObject.username = valueObject.user.username
                    if (valueObject.avatar) {
                        valueObject.avatar = valueObject.avatar.url
                    }
                    valueObject.userId = valueObject.user._id
                }
                delete valueObject.user
                return value
            })
        post.commentCounts += 1
        await post.save({session, new: true})
        await session.commitTransaction()
        return {
            comment: sentComment,
            commentCounts: post.commentCounts
        }
    } catch (e) {
        await session.abortTransaction()
        throw e
    } finally {
        await session.endSession()
    }
}

const getCommentsByPostId = async ({postId, page = 1, limit = 10}) => {
    const skip = (page - 1) * limit
    const comments = await Comment.find({
        post: postId
    })
        .populate(requiredPopulatedComment)
        .skip(skip)
        .limit(limit)

    const totalCount = await Comment.countDocuments({post: postId})
    return {
        comments,
        totalCount
    }
}


export {
    sendComment,
    getCommentsByPostId
}