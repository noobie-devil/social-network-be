import express from "express";
// import authRouter from './auth.js';
import userRouter from "./user.js";
import authRouter from "./auth/index.js";

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
export default router;
