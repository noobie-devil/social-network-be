import jwt from "jsonwebtoken";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {findByUserId} from "../services/keyToken.service.js";
import {asyncHandler} from "../core/utils/core.utils.js";

export const createTokenPair = async (payload, publicKey, privateKey) => {
    const accessToken = await jwt.sign(payload, publicKey, {
        expiresIn: "2 days"
    })
    const refreshToken = await jwt.sign(payload, privateKey, {
        expiresIn: "7 days"
    })

    return {accessToken, refreshToken}

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
