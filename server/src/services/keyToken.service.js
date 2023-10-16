import KeyToken from "../models/keyToken.model.js";
import mongoose from "mongoose";

export const createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
    const filter = {user: userId}
    const update = {
        publicKey, privateKey, refreshTokenUsed: [], refreshToken
    }
    const options = { upsert: true, new: true}
    const tokens = await KeyToken.findOneAndUpdate(filter, update, options)

    return tokens ? tokens.publicKey : null
}

export const findByUserId = async(userId) => {
    return await KeyToken.findOne({ user: new mongoose.Types.ObjectId(userId) }).populate("user").lean().exec()
}

export const removeKeyById = async(id) => {
    return await KeyToken.deleteOne(id).lean().exec()
}

export const findByRefreshTokenUsed = async(refreshToken) => {
    return await KeyToken.findOne({ refreshTokenUsed: refreshToken }).lean().exec()
}

export const findByRefreshToken = async(refreshToken) => {
    console.log(refreshToken)
    return await KeyToken.findOne({ refreshToken: refreshToken}).populate("user", "_id email").lean().exec()
}

export const removeKeyByUserId = async(userId) => {
    return await KeyToken.deleteOne({ user: userId }).exec()
}

