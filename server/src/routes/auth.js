import express from "express";
import {login, refreshToken, register} from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post('/login', login);

authRouter.post('/refresh-token', refreshToken);
export default authRouter;
