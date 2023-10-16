import express from "express";
import userRouter from "./user.js";
import authRouter from "./auth/index.js";
import friendRouter from "./friend/index.js";
import facultyRouter from "./faculty/index.js";
import majorRouter from "./major/index.js";
import enrollmentYearRouter from "./enrollmentYear/index.js";

const router = express.Router();

router.use('/auth', authRouter);
router.use('/friends', friendRouter)
router.use('/users', userRouter);
router.use('/faculty', facultyRouter);
router.use('/major', majorRouter)
router.use('/enrollment-year', enrollmentYearRouter);
export default router;
