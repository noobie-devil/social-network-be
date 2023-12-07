import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {imageResize, uploadAttachments} from "../middlewares/uploadImages.middleware.js";
import {
    createPost,
    getFeedPosts,
    getLikesPost,
    likePost,
    unlikePost,
    uploadPostResources
} from "../controllers/post.controller.js";
import {asyncHandler} from "../core/utils/core.utils.js";


const postRouter = express.Router()

postRouter.use(authentication)
postRouter.post('/uploads', uploadAttachments.fields([
    { name: 'images', maxCount: 30},
    { name: 'videos', maxCount: 10}
]), imageResize, asyncHandler(uploadPostResources))
postRouter.get('/', asyncHandler(getFeedPosts))
postRouter.post('/', asyncHandler(createPost))
postRouter.get('/:postId/likes', asyncHandler(getLikesPost))
postRouter.put('/:postId/likes', asyncHandler(likePost))
postRouter.delete('/:postId/likes', asyncHandler(unlikePost))

export default postRouter
