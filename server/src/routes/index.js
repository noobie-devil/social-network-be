import express from "express";
import userRouter from "./user.routes.js";
import authRouter from "./auth.routes.js";
import friendRouter from "./friend.routes.js";
import facultyRouter from "./faculty.routes.js";
import majorRouter from "./major.routes.js";
import enrollmentYearRouter from "./enrollmenYear.routes.js";
import adminRouter from "./admin.routes.js";
import permissionRouter from "./permission.routes.js";
import assetResourceRouter from "./assetResource.routes.js";
import postRouter from "./post.routes.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {OkResponse} from "../core/success/success.response.js";
import {userLogin, userRefreshToken, userRegister} from "../controllers/access.controller.js";
import {authentication} from "../middlewares/auth.middleware.js";
import {imageResize, uploadAttachments} from "../middlewares/uploadImages.middleware.js";
import {uploadAvatar} from "../controllers/user.controller.js";

const router = express.Router()
// router.use('/login', asyncHandler(userLogin))
// router.use('/register', asyncHandler(userRegister))
// router.use('/refresh-token', asyncHandler(userRefreshToken))
// router.use('/upload-avatar', authentication, uploadAttachments.fields([
//     { name: 'images', maxCount: 1}
// ]), imageResize, asyncHandler(uploadAvatar))
router.use('', authRouter)
router.use('/aauth', adminRouter)
router.use('/permission', permissionRouter)
router.use('/friends', friendRouter)
router.use('/users', userRouter)
router.use('/faculty', facultyRouter)
router.use('/major', majorRouter)
router.use('/enrollment-year', enrollmentYearRouter)
router.use('/asset-resources', assetResourceRouter)
router.use('/posts', postRouter)
export default router;
