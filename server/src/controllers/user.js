import User from "../models/User.js";
import mongoose from "mongoose";
import {UserResponse} from "../dto/UserResponse.js";

export const getUserById = async (req, res, next) => {
    try {
        const uid = req.params.id;
        const isValidId = mongoose.Types.ObjectId.isValid(uid);

        if(!isValidId) {
            return res.status(200).json(new UserResponse());
        }

        const user = await User.findById(uid);
        res.status(200).json(new UserResponse([user]));

    } catch (e) {
        next(e);
    }
}
