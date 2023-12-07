import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {userLogin, userRefreshToken, userRegister} from "../controllers/access.controller.js";
import {imageResize, uploadAttachments} from "../middlewares/uploadImages.middleware.js";
import {uploadAvatar} from "../controllers/user.controller.js";
import {authentication} from "../middlewares/auth.middleware.js";

const authRouter = express.Router()

authRouter.post('/login', asyncHandler(userLogin))
authRouter.post('/register', asyncHandler(userRegister))
authRouter.post('/refresh-token', asyncHandler(userRefreshToken))
authRouter.put('/upload-avatar', authentication, uploadAttachments.fields([
    { name: 'images', maxCount: 1}
]), imageResize, asyncHandler(uploadAvatar))
export default authRouter
