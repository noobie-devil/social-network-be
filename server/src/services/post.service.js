import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {createPostSchema, likePostSchema} from "../schemaValidate/post.schema.js";
import {uploadAssetResource} from "./assetResource.service.js";
import * as postRepository from '../repositories/post.repo.js'
import UserPage from "../models/userpage.model.js";
import {validateMongodbId} from "../utils/global.utils.js";
import {baseQuerySchema} from "../schemaValidate/query.schema.js";

const createNewPost = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await createPostSchema.validateAsync(req.body)
    if(!req.body.userPageAuthor) {
        req.body.userAuthor = req.user._id
    }
    return await postRepository.createNewPost(req.body)
}

const uploadPostResources = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    return await uploadAssetResource(req)
}

const likePost = async(req) => {
    return likeActionsHandler(req, false)
}

const likeActionsHandler = async(req, unlike) => {
    if(!req.user) throw new InvalidCredentialsError()
    const postId = req.params.postId
    validateMongodbId(postId)
    await likePostSchema.validateAsync(req.body)
    req.body.postId = postId
    if(req.body.userType && req.body.userType === "UserPage") {
        const existingUserPage = await UserPage.findOne({user: req.user._id})
        if(existingUserPage) {}
        req.body.userPage = existingUserPage._id
        if(unlike) {
            return await postRepository.unlikePost(req.body)
        } else {
            return await postRepository.likePost(req.body)
        }
    } else {
        req.body.user = req.user._id
        if(unlike) {
            return await postRepository.unlikePost(req.body)
        } else {
            return await postRepository.likePost(req.body)
        }
    }
}

const unlikePost = async(req) => {
    return await likeActionsHandler(req, true)
}

const getLikesPost = async(req) => {
    let currentActorId = null
    if(req.user) {
        currentActorId = req.user._id
    }
    const postId = req.params.postId
    validateMongodbId(postId)
    await baseQuerySchema.validateAsync(req.query)
    // return await postRepository.getLikesPost(postId, req.query)
    return await postRepository.getLikesPost(currentActorId, postId, req.query)
}


export {
    createNewPost,
    likePost,
    unlikePost,
    uploadPostResources,
    getLikesPost
}
