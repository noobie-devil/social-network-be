import * as userRepo from "../repositories/user.repo.js"
import * as adminRepo from "../repositories/admin.repo.js"
import * as userService from "./user.service.js"
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {createTokenPair, verifyJwt} from "../utils/auth.utils.js";
import * as crypto from "crypto";
import * as tokenService from "./keyToken.service.js"
import {ForbiddenError} from "../core/errors/forbidden.error.js";
import {InvalidTokenError} from "../core/errors/invalidToken.error.js";
import jwt from "jsonwebtoken";
import KeyToken from "../models/keyToken.model.js";
import {loginSchema, refreshTokenSchema} from "../schemaValidate/auth.schema.js";


const logout = async({keystore}) => {
    return await tokenService.removeKeyById(keystore._id)
}

export const refreshTokenHandler = async(req, isAdmin) => {
    await refreshTokenSchema.validateAsync(req.body)
    const {refreshToken} = req.body
    const foundToken = await tokenService.findByRefreshTokenUsed(refreshToken)
    if(foundToken) {
        const {userId} = await verifyJwt(refreshToken, foundToken.privateKey)
        if(isAdmin) {
            await tokenService.removeKeyByAdminId(userId)
        } else {
            await tokenService.removeKeyByUserId(userId)
        }
        throw new ForbiddenError("Something wrong happened!! Please re-login")
    }
    const holderToken = await tokenService.findByRefreshToken(refreshToken)
    if(!holderToken) throw new InvalidTokenError()
    const {err, decoded} = await jwt.verify(refreshToken, holderToken.privateKey, (err, decoded) => {
        return { err, decoded }
    })
    if (err) {
        if(err instanceof jwt.TokenExpiredError) {
            if(isAdmin) {
                await tokenService.removeKeyByAdminId(holderToken.user._id)
            } else {
                await tokenService.removeKeyByUserId(holderToken.user._id)
            }
            throw new ForbiddenError()
        } else if (err instanceof jwt.JsonWebTokenError) {
            throw new InvalidTokenError("Invalid refresh token")
        } else {
            throw err
        }
    }
    console.log(decoded)
    if(isAdmin) {
        if(decoded.user_id !== holderToken.admin._id.toString()) {
            throw new InvalidTokenError()
        }
    } else {
        if(decoded.user_id !== holderToken.user._id.toString()) {
            throw new InvalidTokenError()
        }
    }
    const payloadTokenPair = {
        user_id: isAdmin ? holderToken.admin._id : holderToken.user._id,
        email: isAdmin ? holderToken.admin.email : holderToken.user.email
    }
    const tokens = await createTokenPair(payloadTokenPair, holderToken.publicKey, holderToken.privateKey)

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



const login = async(req, isAdmin) => {
    await loginSchema.validateAsync(req.body)
    const {email, password} = req.body
    console.log(req.body)
    let foundUser;
    if(isAdmin) {
        foundUser = await adminRepo.findAdminByEmail(email)
    } else {
        foundUser = await userRepo.findByEmail(email)
    }
    if(!foundUser) throw new InvalidCredentialsError()
    const passwordMatch = await foundUser.comparePassword(password)
    if(!passwordMatch) throw new InvalidCredentialsError()
    const privateKey = crypto.randomBytes(64).toString("hex")
    const publicKey = crypto.randomBytes(64).toString("hex")
    const tokens = await createTokenPair({user_id: foundUser._id, email}, publicKey, privateKey)
    await tokenService.createKeyToken({
        userId: foundUser._id,
        refreshToken: tokens.refreshToken,
        privateKey,
        publicKey
    }, isAdmin)
    foundUser = foundUser.toObject()
    delete foundUser.password
    return {
        user: foundUser,
        tokens
    }
}
const register = async(req) => {
    return await userService.createUser(req)
}


export {
    login, register, logout
}
