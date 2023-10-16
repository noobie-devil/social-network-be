import {findByEmail} from "./user.service.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import User from "../models/User.js";
import {createTokenPair, generateAccessToken, verifyJwt} from "../utils/auth.utils.js";
import * as crypto from "crypto";
import {omitFields} from "../utils/lodash.utils.js";
import {
    createKeyToken,
    findByRefreshToken,
    findByRefreshTokenUsed,
    removeKeyById,
    removeKeyByUserId
} from "./keyToken.service.js";
import {InternalServerError} from "../core/errors/internalServer.error.js";
import {ValidationError} from "../core/errors/validation.error.js";
import {ForbiddenError} from "../core/errors/forbidden.error.js";
import {InvalidTokenError} from "../core/errors/invalidToken.error.js";
import jwt from "jsonwebtoken";
import KeyToken from "../models/keyToken.model.js";
import {registerSchema, refreshTokenSchema} from "../schemaValidate/auth/auth.schema.js";


export const logoutHandler = async({keystore}) => {
    const delKey = await removeKeyById(keystore._id)
    return delKey
}

export const refreshTokenHandler = async(req) => {
    await refreshTokenSchema.validateAsync(req.body)
    const {refreshToken} = req.body
    const foundToken = await findByRefreshTokenUsed(refreshToken)
    if(foundToken) {
        const {userId, email} = await verifyJwt(refreshToken, foundToken.privateKey)
        await removeKeyByUserId(userId)
        throw new ForbiddenError("Something wrong happened!! Please relogin")
    }
    const holderToken = await findByRefreshToken(refreshToken)
    if(!holderToken) throw new InvalidTokenError()
    const {err, decoded} = await jwt.verify(refreshToken, holderToken.privateKey, (err, decoded) => {
        return {err, decoded}
    })
    if (err) {
        if (err instanceof jwt.TokenExpiredError) {
            await removeKeyByUserId(holderToken.user._id)
            throw new ForbiddenError()
        } else if (err instanceof jwt.JsonWebTokenError) {
            throw new InvalidTokenError("Invalid refresh token")
        } else {
            throw err
        }
    }
    console.log(decoded)
    if (decoded.user_id !== holderToken.user._id.toString()) {
        console.log(decoded.userId)
        console.log(holderToken.user._id)
        throw new InvalidTokenError()
    }
    const tokens = await createTokenPair({
        user_id: holderToken.user._id,
        email: holderToken.user.email
    }, holderToken.publicKey, holderToken.privateKey)

    await KeyToken.updateOne({
        refreshToken
    }, {
        $set: {
            refreshToken: tokens.refreshToken
        },
        $addToSet: {
            refreshTokenUsed: refreshToken
        }
    })

    return tokens

}

export const loginHandler = async({ email, password, refreshToken = null}) => {
    const foundUser = await findByEmail({ email })
    if(!foundUser) throw new InvalidCredentialsError()

    const match = await foundUser.comparePassword(password)
    if(!match) throw new InvalidCredentialsError()

    const privateKey = crypto.randomBytes(64).toString("hex")
    const publicKey = crypto.randomBytes(64).toString("hex")
    const tokens = await createTokenPair({ user_id: foundUser._id, email}, publicKey, privateKey)
    await createKeyToken({
        userId: foundUser._id,
        refreshToken: tokens.refreshToken,
        privateKey,
        publicKey
    })
    console.log(tokens)
    return {
        user: omitFields({ fields: ['_id', 'email', 'username', 'picturePath', 'status'], obj: foundUser}),
        tokens
    }
}

export const registerHandler = async(req) => {
    await registerSchema.validateAsync(req.body)
    const {email} = req.body
    const emailExists = await User.findOne({email}).lean()

    if(emailExists) throw new ValidationError({
        message: 'This email is already been registered',
        statusCode: 409
    })
    const newUser = await User.create(req.body)
    if(newUser) {
        const privateKey = crypto.randomBytes(64).toString("hex")
        const publicKey = crypto.randomBytes(64).toString("hex")

        const keyStore = await createKeyToken({
            userId: newUser._id,
            publicKey,
            privateKey
        })
        if(!keyStore) {
            throw new InternalServerError("keystore error")
        }
        const tokens = await createTokenPair({ user_id: newUser._id }, publicKey, privateKey)
        console.log(newUser)
        console.log(tokens)
        return {
            user: newUser,
            tokens
        };
    }

}
