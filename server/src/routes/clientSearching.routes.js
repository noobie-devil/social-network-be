import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {findUsers} from "../controllers/user.controller.js";

const clientSearchingRouter = express.Router()

clientSearchingRouter.use(authentication)
clientSearchingRouter.get('/users', asyncHandler(findUsers))

export default clientSearchingRouter