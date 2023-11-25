import User from "../models/User.js";
import { ValidationError } from "../core/errors/validation.error.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {authenticateRefreshToken, generateTokens} from '../services/auth-service.js';
import Joi from "joi";
import * as crypto from "crypto";
import {createKeyToken} from "../services/keyToken.service.js";
import {InternalServerError} from "../core/errors/internalServer.error.js";
import {createTokenPair} from "../utils/auth.utils.js";
import {loginSchema, registerSchema, refreshTokenSchema} from "../schemaValidate/auth.schema.js";

export const register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
        } = req.body;

        try {
            await registerSchema.validateAsync(req.body);
        } catch (error) {
            if(error instanceof Joi.ValidationError) {
                throw new ValidationError({
                    error: error
                });
            } else {
                throw error;
            }
        }

        const emailExists = await User.findOne({ email: email});
        if(emailExists) {
            throw new ValidationError({
                message: `This email is already been registered`,
                statusCode: 409
            });
        }
        // const { privateKey, publicKey } = crypto.generateKeySync('rsa', {
        //     modulusLength: 4096,
        //     publicKeyEncoding: {
        //         type: 'pkcs1',
        //         format: 'pem'
        //     },
        //     privateKeyEncoding: {
        //         type: 'pkcs1',
        //         format: 'pem'
        //     }
        // })

        const privateKey = crypto.randomBytes(64).toString("hex")
        const publicKey = crypto.randomBytes(64).toString("hex")

        console.log({ privateKey, publicKey })


        const newUser = await User.create(req.body)
        if(newUser) {
            const keyStore = await createKeyToken({
                userId: newUser._id,
                publicKey,
                privateKey
            })

            if(!keyStore) {
                throw new InternalServerError("keystore error")
            }

            const tokens = await createTokenPair({userId: newUser._id, email}, publicKey, privateKey)
                res.status(201).json({
                user: newUser,
                tokens
            })
        }



        // const newUser = new User({
        //         firstName,
        //         lastName,
        //         email,
        //         password
        //
        // });
        // const savedUser = await newUser.save();
        res.status(200).json(null);
    } catch (err) {
        next(err);
    }
}

export const login = async (req, res, next) => {
    try {
        try {
            await loginSchema.validateAsync(req.body);
        } catch (error) {
            if(error instanceof Joi.ValidationError) {
                throw new ValidationError({
                    error: error
                });
            } else {
                throw error;
            }
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new InvalidCredentialsError();
        }
        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            throw new InvalidCredentialsError();
        }

        // const accessToken = generateAccessToken(friend.id);
        // const refreshToken = await generateRefreshToken(friend.id);
        const { accessToken, refreshToken } = await generateTokens(user.id);
        res.status(200).json({
            accessToken: accessToken,
            refreshToken: refreshToken
        })
    } catch (e) {
        next(e);
    }
}

export const refreshToken = async (req, res, next) => {

    refreshTokenSchema.validateAsync(req.body)
        .then(async (value) => {
            try {
                const { accessToken, refreshToken } = await authenticateRefreshToken(value.refreshToken);
                res.status(200).json({
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });
            } catch (e) {
                next(e);
            }
        })
        .catch((error) => {
            next(new ValidationError({ error: error}));
        })
}

