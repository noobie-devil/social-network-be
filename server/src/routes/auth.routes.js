import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {logout, userLogin, userRefreshToken, userRegister} from "../controllers/access.controller.js";
import {imageResize, uploadAttachments} from "../middlewares/uploadImages.middleware.js";
import {removeAvatar, uploadAvatar} from "../controllers/user.controller.js";
import {authentication} from "../middlewares/auth.middleware.js";
import {userUpdateProfile} from "../services/user.service.js";

const authRouter = express.Router()

authRouter.post('/login', asyncHandler(userLogin))
authRouter.delete('/logout', authentication, asyncHandler(logout))
authRouter.post('/register', asyncHandler(userRegister))
authRouter.post('/refresh-token', asyncHandler(userRefreshToken))
authRouter.put('/avatar', authentication, uploadAttachments.fields([
    { name: 'images', maxCount: 1}
]), imageResize, asyncHandler(uploadAvatar))
authRouter.delete('/avatar', authentication, asyncHandler(removeAvatar))
authRouter.put('/profile', authentication, asyncHandler(userUpdateProfile))
export default authRouter
