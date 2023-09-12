import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { v4 as uuidv4 } from 'uuid';
import {InvalidTokenError} from "../errors/InvalidTokenError.js";
import User from "../models/User.js";
import user from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {InternalServerError} from "../errors/InternalServerError.js";
import {ValidationError} from "../errors/ValidationError.js";
import registerSchema from "../schema_validate/register_schema.js";
import {InvalidCredentialsError} from "../errors/InvalidCredentialsError.js";


const ACCESS_TOKEN_SECRET = 'my_access_token_secret';
const ACCESS_TOKEN_EXPIRATION_TIME = '15m';
const REFRESH_TOKEN_SECRET = 'my_refresh_token_secret';
const REFRESH_TOKEN_EXPIRATION_TIME = '7d';

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: ACCESS_TOKEN_SECRET
}, async(payload, done) => {
    try {
        const user = await User.findById(payload.userId);
        if(!user) {
            return done(null, false, { message: 'Not found user.' });
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
}));

const generateAccessToken = (userId) => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + Number(ACCESS_TOKEN_EXPIRATION_TIME.split('m')[0]) * 60
    };

    const options = {
        expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
        subject: userId,
    };
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
}

const generateRefreshToken = async (userId) => {
    try {
        const payload = {
            sub: userId,
            jti: uuidv4(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + Number(REFRESH_TOKEN_EXPIRATION_TIME.split('d')[0]) * 24 * 60 * 60
        }

        const options = {
            expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
            subject: userId,
            jwtid: payload.jti
        };

        const store = new RefreshToken({
            jwtId: payload.jti,
            expiresAt: payload.exp
        });

        store.save();
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
    } catch (error) {
        throw new InternalServerError();
    }
}

const authenticateAccessToken = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if(err || !user) {
            next(new InvalidTokenError('Unauthorized'));
        }
        req.user = user;
        next();
    });
}

const authenticateRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            refreshToken,
            REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) {
                    return reject(new InvalidTokenError());
                }
                const userId = decoded.sub;
                User.findById(userId)
                    .then((user) => {
                        if (!user) {
                            return reject(new InvalidTokenError());
                        }
                        const jwtId = decoded.jwtid;
                        RefreshToken.findOne({ jwtId: jwtId })
                            .then((rf) => {
                                if (!rf || rf.expiresAt < new Date().getTime()) {
                                    return reject('Invalid refresh token');
                                }

                                RefreshToken.deleteOne({ jwtId: jwtId })
                                    .then(() => {
                                        try {
                                            const accessToken = generateAccessToken(userId);
                                            const newRefreshToken = generateRefreshToken(userId);
                                            resolve({ accessToken: accessToken, refreshToken: newRefreshToken });
                                        } catch (err) {
                                            reject(new InternalServerError());
                                        }
                                    })
                                    .catch((err) => {
                                        reject(err);
                                    });
                            })
                            .catch((err) => reject(err));
                    })
                    .catch((err) => reject(err));
            }
        );
    });
};


export const register = async ({ firstName, lastName, email, password }) => {

        const emailExists = await User.findOne({ email: email});
        if(emailExists) {
            throw new ValidationError({
                message: `${email} is already been registered`,
                statusCode: 409
            });
        }

        const {error} = await registerSchema.validateAsync(req.body);
        if(error) {
            throw new ValidationError({
                error: error
            });
        }

        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password

        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        next(err);
    }
}

const login = async ({ email, password }) => {

    const user = await User.findOne({ email });
    if (!user) {
        throw new InvalidCredentialsError();
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new InvalidCredentialsError();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return { accessToken, refreshToken };

}
