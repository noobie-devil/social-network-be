import jwt from 'jsonwebtoken';
import passport from 'passport';
import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt';
import {v4 as uuidv4} from 'uuid';
import {InvalidTokenError} from "../core/errors/invalidToken.error.js";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {ForbiddenError} from "../core/errors/forbidden.error.js";


const ACCESS_TOKEN_SECRET = 'J@NcRfUjXn2r5u7x!A%D*G-KaPdSgVkY';
const ACCESS_TOKEN_EXPIRATION_TIME = '15m';
const REFRESH_TOKEN_SECRET = 'mZq4t7w!z%C&F)J@NcRfUjXn2r5u8x/A';
const REFRESH_TOKEN_EXPIRATION_TIME = '7d';

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: ACCESS_TOKEN_SECRET
}, async (payload, done) => {
    try {
        console.log("asd: " + payload);
        const user = await User.findById(payload.sub);
        if (!user) {
            return done(null, false, {message: 'Not found friend.'});
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
}));


export const generateTokens = async (userId) => {
    try {
        const current = Date.now();

        const payload = {
            sub: userId.toString(),
            iat: Math.floor(current / 1000),
        }

        const accessToken = jwt.sign(
            payload,
            ACCESS_TOKEN_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
            });

        const optionsRefreshToken = {
            expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
            jwtid: uuidv4()
        }
        const refreshToken = jwt.sign(
            payload,
            REFRESH_TOKEN_SECRET,
            optionsRefreshToken
        );

        const refresh = new RefreshToken({
            jwtId: optionsRefreshToken.jwtid,
            expiresAt: (current / 1000) + Number(REFRESH_TOKEN_EXPIRATION_TIME.split('d')[0]) * 24 * 60 * 60
        });

        refresh.save().then(() => {
            // do something after saving refresh token
            console.log("save refresh token succes");
        }).catch((error) => {
            console.error(error);
        });

        return {accessToken, refreshToken};
    } catch (error) {
        throw error;
    }
}


export const authenticateAccessToken = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        console.log("authenticateAccessToken");
        if (err || !user) {
            console.log(err);
            console.log(user);
            console.log(info);
            next(new InvalidTokenError('Unauthorized'));
        } else {
            req.user = user;
            next();
        }

    })(req, res, next);
}
export const authenticateRefreshToken = async (refreshToken) => {
    try {
        const decoded = await jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, {ignoreExpiration: true});

        const userId = decoded.sub;
        const isUserExistsPromise = User.findById(userId).select('_id').lean();

        const jwtId = decoded.jti;
        const isRefreshTokenExistsPromise = RefreshToken.findOne({jwtId: jwtId}).select('_id expiresAt').lean();

        const [isUserExists, isRefreshTokenExists] = await Promise.all([isUserExistsPromise, isRefreshTokenExistsPromise]);

        if (!isUserExists) {
            throw new InvalidTokenError();
        }

        const current = Date.now() / 1000;
        if (!isRefreshTokenExists || isRefreshTokenExists.expiresAt < current) {
            throw new InvalidTokenError("Invalid refresh token");
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateTokens(userId);

        RefreshToken.deleteOne({jwtId: jwtId}).then(() => {
            // do something after deleting refresh token
            console.log("Deleted old refresh token");
        }).catch((error) => {
            console.error(error);
        });

        return {accessToken, refreshToken: newRefreshToken};
        // await RefreshToken.deleteOne({ jwtId: jwtId });
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            throw new ForbiddenError();
        } else if (e instanceof jwt.JsonWebTokenError) {
            throw new InvalidTokenError("Invalid refresh token");
        } else {
            throw e;
        }
    }

}



