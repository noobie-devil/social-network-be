import express from "express";
import userRouter from "./user.js";
import authRouter from "./auth.routes.js";
import friendRouter from "./friend.routes.js";
import facultyRouter from "./faculty.routes.js";
import majorRouter from "./major.routes.js";
import enrollmentYearRouter from "./enrollmenYear.routes.js";

const router = express.Router();

router.use('/auth', authRouter);
router.use('/friends', friendRouter)
router.use('/users', userRouter);
router.use('/faculty', facultyRouter);
router.use('/major', majorRouter)
router.use('/enrollment-year', enrollmentYearRouter);
export default router;
