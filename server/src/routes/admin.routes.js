import express from "express";
import {asyncHandler} from "../core/utils/core.utils.js";
import {createAdmin} from "../controllers/admin.controller.js";


const adminRouter = express.Router()
adminRouter.post('/', asyncHandler(createAdmin))

export default adminRouter
