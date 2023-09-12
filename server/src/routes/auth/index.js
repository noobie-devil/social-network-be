import express from "express";
import {asyncHandler} from "../../core/utils/core.utils.js";
import {login, refreshToken, register} from "../../controllers/access.controller.js";

const authRouter = express.Router()
authRouter.post('/login', asyncHandler(login))
authRouter.post('/register', asyncHandler(register))
authRouter.post('/refresh-token', asyncHandler(refreshToken))
export default authRouter
