import {CreatedResponse, OkResponse, SuccessResponse} from "../core/success/success.response.js"
import * as postService from '../services/post.service.js'

export const uploadPostResources = async(req, res, next) => {
    new CreatedResponse({
        data: await postService.uploadPostResources(req)
    }).send(res)
}

export const createPost = async(req, res, next) => {
    new CreatedResponse({
        data: await postService.createNewPost(req)
    }).send(res)
}

export const getPostById = async (req, res, next) => {
    new SuccessResponse({
        data: await postService.getPostById(req)
    }).send(res)
}

export const updatePost = async(req, res, next) => {
    new SuccessResponse({
        data: await postService.updatePost(req)
    }).send(res)
}

export const deletePost = async(req, res, next) => {
    new SuccessResponse({
        message: await postService.deletePost(req)
    }).send(res)
}

export const likePost = async(req, res, next) => {
    new OkResponse({
        data: await postService.likePost(req)
    }).send(res)
}

export const unlikePost = async(req, res, next) => {
    new OkResponse({
        data: await postService.unlikePost(req)
    }).send(res)
}

export const getLikesPost = async(req, res, next) => {
    new OkResponse({
        data: await postService.getLikesPost(req)
    }).send(res)
}

export const getFeedPosts = async(req, res, next) => {
    new OkResponse({
        data: await postService.getFeedPosts(req)
    }).send(res)
}

export const getUserPosts = async(req, res, next) => {
    new SuccessResponse({
        data: await postService.getUserPosts(req)
    }).send(res)
}
