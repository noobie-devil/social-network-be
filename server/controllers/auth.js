import bcrypt from "bcrypt";
import User from "../models/User.js";
import {ValidationError} from "../errors/ValidationError.js";
import registerSchema from "../schema_validate/register_schema.js";

export const register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
        } = req.body;

        const emailExists = await User.findOne({ email: email});
        if(emailExists) {
            throw new ValidationError({
                message: `${email} is already been registered`,
                statusCode: 409
            });
        }

        const {error} = registerSchema.validate(req.body);
        if(error) {
            throw new ValidationError({
                error: error
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        next(err);
    }
}

