import {CreatedResponse, OkResponse} from "../core/success/success.response.js"
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
