import {asyncHandler} from "../core/utils/core.utils.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import jwt from "jsonwebtoken";
import {findByUserId} from "../services/keyToken.service.js";

export const authentication = asyncHandler(async(req, res, next) => {
    let token;
    if(req?.header?.authorization?.startsWith('Bearer')) {
        token = req?.headers.authorization.split(" ")[1]
        if(!token) throw new InvalidCredentialsError("Unauthorized")
        const decodeUser = jwt.decode(token)
        const userId = decodeUser.userId
        const keystore = await findByUserId(userId)
        if(!keystore) throw new InvalidCredentialsError()
        try {
            const verify = jwt.verify(token, keystore.publicKey)
            req.keystore = keystore
            return next()
        } catch (err) {
            throw err
        }
    }
})
