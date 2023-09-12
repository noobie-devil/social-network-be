import jwt from "jsonwebtoken";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {findByUserId} from "../services/keyToken.service.js";
import {asyncHandler} from "../core/utils/core.utils.js";

export const createTokenPair = async (payload, publicKey, privateKey) => {
    const accessToken = await generateAccessToken(payload, publicKey)
    const refreshToken = await generateRefreshToken(payload, privateKey)

    return {accessToken, refreshToken}
}

export const generateRefreshToken = async(payload, privateKey) => {
    return await jwt.sign(payload, privateKey, {
        expiresIn: "7d"
    })
}

export const generateAccessToken = async(payload, publicKey) => {
    return await jwt.sign(payload, publicKey, {
        expiresIn: "2d"
    })
}

const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers['x-client-id']
    if(!userId) throw new InvalidCredentialsError()

    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new InvalidCredentialsError()

    const accessToken = req.headers['Authorization']
    if(!accessToken) throw new InvalidCredentialsError("Unauthorized")

    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new InvalidCredentialsError()
        req.keystore = keystore
        return next()
    } catch (error) {
        throw error
    }
})

export const verifyJwt = async(token, keySecret) => {
    return await jwt.verify(token, keySecret)
}
