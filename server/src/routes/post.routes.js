import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {imageResize, uploadAttachments} from "../middlewares/uploadImages.middleware.js";
import {createPost, likePost, uploadPostResources} from "../controllers/post.controller.js";


const postRouter = express.Router()

postRouter.use(authentication)
postRouter.post('/uploads', uploadAttachments.fields([
    { name: 'images', maxCount: 30},
    { name: 'videos', maxCount: 10}
]), imageResize, uploadPostResources)
postRouter.post('/', createPost)
postRouter.put('/:postId/likes', likePost)

export default postRouter
