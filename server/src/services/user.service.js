import User from "../models/User.js";

export const findByEmail = async({email, select = {
    email: 1, password: 1, username: 1, status: 1
}}) => {
    return await User.findOne({email}).select(select).exec()
}
