import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {
    createPostSchema,
    getFeedPostsSchema,
    likePostSchema,
    queryUserPostsSchema, updatePostPrivacySchema,
    updatePostSchema
} from "../schemaValidate/post.schema.js";
import {uploadAssetResource} from "./assetResource.service.js";
import * as postRepository from '../repositories/post.repo.js'
import UserPage from "../models/userpage.model.js";
import {validateMongodbId} from "../utils/global.utils.js";
import {baseQuerySchema} from "../schemaValidate/query.schema.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";

const createNewPost = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await createPostSchema.validateAsync(req.body)
    if(!req.body.userPageAuthor) {
        req.body.userAuthor = req.user._id
    }
    return await postRepository.createNewPost(req.body)
}

const getPostById = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const postId = req.params.postId
    validateMongodbId(postId)
    return await postRepository.getPostById(postId)
}

const uploadPostResources = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    return await uploadAssetResource(req)
}

const updatePostPrivacy = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const postId = req.params.postId
    validateMongodbId(postId)
    await updatePostPrivacySchema.validateAsync(req.body)
    return await postRepository.updatePostPrivacy(req.user._id, postId, req.body)
}

const updatePost = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const postId = req.params.postId
    validateMongodbId(postId)
    await updatePostSchema.validateAsync(req.body)
    return await postRepository.updatePost(req.user._id, postId, req.body)
}

const deletePost = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const postId = req.params.postId
    validateMongodbId(postId)
    return await postRepository.deletePost(postId)
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
        if(unlike) {
            return await postRepository.unlikePost({...req.body, user: req.user})
        } else {
            return await postRepository.likePost({...req.body, user: req.user})
        }
    }
}

const unlikePost = async(req) => {
    return await likeActionsHandler(req, true)
}


const getUserPosts = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await queryUserPostsSchema.validateAsync(req.query)
    const userId = req.params.userId
    validateMongodbId(userId)
    return await postRepository.getUserPosts({...req.query, userId, currentUser: req.user})
}

const getFeedPosts = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await getFeedPostsSchema.validateAsync(req.query)
    let _id = null
    if(req.body.userType && req.body.userType === "UserPage") {
        const existingUserPage = await UserPage.findOne({user: req.user._id})
        if(!existingUserPage) throw new BadRequestError()
        _id = existingUserPage._id
    } else {
        _id = req.user._id
    }
    // return await postRepository.getFeedPosts(_id, req.query)
    return await postRepository.getFeedPosts({...req.query, user: req.user})
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
    // req.query.postId = postId
    // req.query.userId = req.user._id
    return await postRepository.getRelatesLikePost({...req.query, postId: postId, user: req.user})
    // return await postRepository.getLikesPost(currentActorId, postId, req.query)
}


export {
    getPostById,
    createNewPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    uploadPostResources,
    getLikesPost,
    getFeedPosts,
    getUserPosts,
    updatePostPrivacy
}
