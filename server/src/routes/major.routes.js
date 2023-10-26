import express from "express";
import {authentication} from "../middlewares/auth.middleware.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import {createMajor, deleteMajor, updateMajor} from "../controllers/major.controller.js";

const majorRouter = express.Router()

majorRouter.use(authentication)
majorRouter.post('/', asyncHandler(createMajor))
majorRouter.put("/:majorId", asyncHandler(updateMajor))
majorRouter.delete("/:majorId", asyncHandler(deleteMajor))

export default majorRouter
