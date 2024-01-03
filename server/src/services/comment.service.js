import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js"
import {validateMongodbId} from "../utils/global.utils.js"
import {sendCommentSchema} from "../schemaValidate/comment.schema.js"
import * as commentRepository from "../repositories/comment.repo.js"
import {baseQuerySchema} from "../schemaValidate/query.schema.js";

const sendComment = async(req) => {
    console.log("sendComment")
    if(!req.user) throw new InvalidCredentialsError()
    const postId = req.params.postId
    validateMongodbId(postId)
    await sendCommentSchema.validateAsync(req.body)
    req.body.user = req.user._id
    req.body.post = postId
    return await commentRepository.sendComment(req.user, req.body)
}

const getCommentsByPostId = async(req) => {
    console.log("getComments")
    if(!req.user) throw new InvalidCredentialsError()
    const postId = req.params.postId
    validateMongodbId(postId)
    await baseQuerySchema.validateAsync(req.query)
    return await commentRepository.getCommentsByPostId({...req.query, postId})
}

export {
    sendComment,
    getCommentsByPostId
}