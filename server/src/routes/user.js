import express from "express";
import { getUserById } from "../controllers/user.js";
import {authenticateAccessToken} from "../services/auth-service.js";

const userRouter = express.Router();

userRouter.get("/:id", authenticateAccessToken, getUserById);
userRouter.get('/cc', (req, res) => {
    res.json({message: "nhu loz"});
})
export default userRouter;
