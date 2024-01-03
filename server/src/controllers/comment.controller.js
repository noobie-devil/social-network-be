import {CreatedResponse, SuccessResponse} from "../core/success/success.response.js"
import * as commentService from "../services/comment.service.js"
export const sendComment = async(req, res, next) => {
    new CreatedResponse({
        data: await commentService.sendComment(req)
    }).send(res)
}

export const getCommentsByPostId = async(req, res, next) => {
    new SuccessResponse({
        data: await commentService.getCommentsByPostId(req)
    }).send(res)
}