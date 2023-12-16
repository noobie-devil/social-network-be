import {asyncHandler} from "../core/utils/core.utils.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import jwt from "jsonwebtoken";
import * as tokenService from "../services/keyToken.service.js";
import {ForbiddenError} from "../core/errors/forbidden.error.js";
import {InvalidTokenError} from "../core/errors/invalidToken.error.js";

export const authentication = asyncHandler(async(req, res, next) => {
    let token;
    if(req?.headers?.authorization?.startsWith('Bearer')) {
        token = req?.headers.authorization.split(" ")[1]
        if(!token) throw new InvalidCredentialsError("Unauthorized")
        const decodeUser = jwt.decode(token)
        const userId = decodeUser.user_id
        const keystore = await tokenService.findByUserId(userId)
        if(!keystore) throw new InvalidCredentialsError()
        try {
            jwt.verify(token, keystore.publicKey)
            req.keystore = keystore
            if(keystore.user) {
                req.user = keystore.user
                req.isAdmin = false
            } else {
                req.user = keystore.admin
                req.isAdmin = true
            }
            return next()
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new InvalidTokenError("Token expired");
            } else if (err instanceof jwt.JsonWebTokenError) {
                throw new ForbiddenError("Invalid token");
            } else {
                throw err;
            }
        }
    } else {
        throw new InvalidCredentialsError("Unauthorized")
    }
})
