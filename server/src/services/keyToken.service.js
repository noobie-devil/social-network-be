import KeyToken from "../models/keyToken.model.js";
import mongoose from "mongoose";
import {BadRequestError} from "../core/errors/badRequest.error.js";

const createKeyToken = async ({userId, publicKey, privateKey, refreshToken}, isAdmin) => {
    const filter = isAdmin ? { admin: userId } : { user: userId }
    const tokens = await KeyToken.findOneAndUpdate(filter, {
        publicKey, privateKey, refreshTokenUsed: [], refreshToken
    }, { upsert: true, new: true})
    return tokens ? tokens.publicKey : null
}

// const findByUserId = async(userId) => {
//     return await KeyToken.findOne({ user: new mongoose.Types.ObjectId(userId) }).populate("user").lean().exec()
// }

const findByAdminId = async(aid) => {
    return await KeyToken.findOne({ admin: new mongoose.Types.ObjectId(aid) }).populate("admin").lean().exec()
}

const removeKeyById = async(id) => {
    const deletedKeystore =  await KeyToken.deleteOne(id).lean().exec()
    if(!deletedKeystore) {
        throw new BadRequestError()
    }
    return "Logout success"

}

const findByRefreshTokenUsed = async(refreshToken) => {
    return await KeyToken.findOne({ refreshTokenUsed: refreshToken }).lean().exec()
}

const findByUserId = async(uid) => {
    const filter = {
        $or: [{ admin: uid}, { user: uid}]
    }
    return await KeyToken.findOne(filter)
        .populate("user")
        .populate("admin")
        .lean()
        .exec()
}

const findByRefreshToken = async(refreshToken) => {
    console.log(refreshToken)
    return await KeyToken.findOne({ refreshToken: refreshToken})
        .populate("admin", "_id email")
        .populate("user", "_id email")
        .lean()
        .exec()
}

const removeKeyByUserId = async(userId) => {
    return await KeyToken.deleteOne({ user: userId }).exec()
}

// const removeKeyByUserId = async(uid) => {
//     const filter = {
//         $or: [{ admin: uid }, { user: uid }]
//     }
//     return await KeyToken.findOneAndDelete(filter).exec()
// }

const removeKeyByAdminId = async(aid) => {
    return await KeyToken.deleteOne({ admin: aid }).exec()
}

export {
    createKeyToken,
    findByUserId,
    findByAdminId,
    removeKeyById,
    findByRefreshTokenUsed,
    findByRefreshToken,
    removeKeyByUserId,
    removeKeyByAdminId
}
