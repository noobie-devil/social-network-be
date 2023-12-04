import express from "express";
import userRouter from "./user.js";
import authRouter from "./auth.routes.js";
import friendRouter from "./friend.routes.js";
import facultyRouter from "./faculty.routes.js";
import majorRouter from "./major.routes.js";
import enrollmentYearRouter from "./enrollmenYear.routes.js";
import adminRouter from "./admin.routes.js";
import permissionRouter from "./permission.routes.js";
import assetResourceRouter from "./assetResource.routes.js";
import postRouter from "./post.routes.js";

const router = express.Router()
router.use('/auth', authRouter)
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
