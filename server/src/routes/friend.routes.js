import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {
    getFriendRequests,
    getFriendsList,
    respondToFriendRequest,
    sendFriendRequest
} from "../controllers/user.controller.js";
import {authentication} from "../middlewares/auth.middleware.js";

const friendRouter = express.Router()

friendRouter.use(authentication)
friendRouter.get("/", asyncHandler(getFriendsList))
friendRouter.get("/requests", asyncHandler(getFriendRequests))
friendRouter.put("/", asyncHandler(respondToFriendRequest))
friendRouter.post("/:receiverId", asyncHandler(sendFriendRequest))
export default friendRouter
