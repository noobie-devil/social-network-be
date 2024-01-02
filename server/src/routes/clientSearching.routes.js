import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {findUserById, findUsers} from "../controllers/user.controller.js";

const clientSearchingRouter = express.Router()

clientSearchingRouter.use(authentication)
clientSearchingRouter.get('/users', asyncHandler(findUsers))
clientSearchingRouter.get('/users/:userId', asyncHandler(findUserById))

export default clientSearchingRouter