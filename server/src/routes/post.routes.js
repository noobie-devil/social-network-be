import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {imageResize, uploadAttachments} from "../middlewares/uploadImages.middleware.js";
import {
    createPost, deletePost,
    getFeedPosts,
    getLikesPost, getPostById, getUserPosts,
    likePost,
    unlikePost, updatePost,
    uploadPostResources
} from "../controllers/post.controller.js";
import {asyncHandler} from "../core/utils/core.utils.js";


const postRouter = express.Router()

postRouter.use(authentication)
// Post Attachments with images, videos
postRouter.post('/uploads', uploadAttachments.fields([
    { name: 'images', maxCount: 30},
    { name: 'videos', maxCount: 10}
]), imageResize, asyncHandler(uploadPostResources))
// Get new feeds
postRouter.get('/new-feeds', asyncHandler(getFeedPosts))
// User posts
postRouter.get('/users/:userId', asyncHandler(getUserPosts))
// Post handlers
postRouter.get('/:postId', asyncHandler(getPostById))
postRouter.post('/', asyncHandler(createPost))
postRouter.put('/:postId', asyncHandler(updatePost))
postRouter.delete('/:postId', asyncHandler(deletePost))

// Like handlers
postRouter.get('/:postId/likes', asyncHandler(getLikesPost))
postRouter.put('/:postId/likes', asyncHandler(likePost))
postRouter.delete('/:postId/likes', asyncHandler(unlikePost))

export default postRouter
