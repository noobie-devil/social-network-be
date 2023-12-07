import express from "express";
import {createUser, getUserById, updateUserById} from "../controllers/user.controller.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {authentication} from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/:id", authentication, getUserById);
userRouter.post("/", asyncHandler(createUser))
userRouter.put("/:id", authentication, asyncHandler(updateUserById))
export default userRouter;
