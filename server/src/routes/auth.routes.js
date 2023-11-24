import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {userLogin, userRefreshToken, userRegister} from "../controllers/access.controller.js";

const authRouter = express.Router()
authRouter.post('/login', asyncHandler(userLogin))
authRouter.post('/register', asyncHandler(userRegister))
authRouter.post('/refresh-token', asyncHandler(userRefreshToken))
export default authRouter
