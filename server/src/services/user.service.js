import * as userRepository from "../models/repositories/user.repo.js";
import {validateMongodbId} from "../utils/validateMongodbId.js";
import User from "../models/User.js";
import {UserModel, CollegeStudent,Lecturer, Candidate} from "../models/user.model.js"
import {NotFoundError} from "../core/errors/notFound.error.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {createUserSchema, respondFriendRequestSchema, updateUserSchema} from "../schemaValidate/user/user.schema.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import {cleanData, parseNestedObj} from "../utils/lodash.utils.js";
import {ValidationError} from "../core/errors/validation.error.js";

export const findByEmail = async ({email}) => {
    return await userRepository.findUserByEmail({email});
}

export const findByUserId = async (userId) => {
    return await userRepository.findUserById(userId);
}

export const findById = async(req) => {
    validateMongodbId(req.params.id)
    return await userRepository.findById(req.params.id);
}

export const sendFriendRequest = async (req) => {
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;
    validateMongodbId(senderId);
    validateMongodbId(receiverId);

    const receiver = await User.findById(receiverId);
    if (!receiver) throw new NotFoundError("Not found friend");
    return await userRepository.sendFriendRequest({senderId, receiverId})
}


export const respondToFriendRequest = async (req) => {
    await respondFriendRequestSchema.validateAsync(req.body)
    const {friendShipId, status} = req.body
    if (!req.user) throw new InvalidCredentialsError()
    const receiverId = req.user._id;
    return await userRepository.respondFriendRequest({friendShipId, receiverId, status})
}

export const getFriendsList = async (req) => {
    if (!req.user) throw new InvalidCredentialsError()
    const {search, limit, page} = req.body
    const userId = req.user._id
    return await userRepository.getFriendsList({userId, search, limit, page})
}

export const getFriendRequests = async (req) => {
    if (!req.user) throw new InvalidCredentialsError()
    const {search, limit, page} = req.body
    const userId = req.user._id
    return await userRepository.getFriendRequests({userId, search, limit, page})
}

export const updateUserById = async(req) => {
    const id = req.params.id
    const user = await findById(req)
    if(!user) throw new NotFoundError()
    req.body['type'] = user.type
    await updateUserSchema.validateAsync(req.body)
    const username = req.body.username
    if(!username && !username.trim().isEmpty()) {
        const existUserName = UserModel.findOne({
            _id: { $ne: id},
            username
        })
        if(existUserName) throw new ValidationError({
            message: "Username already exists",
            statusCode: 409
        })
    }
    return new userClasses[user.type](req.body).update(req.params.id)
}


let userClasses = {
}
export const createUser = async (req) => {
    await createUserSchema.validateAsync(req.body)
    const userClass = userClasses[req.body.type]
    if (!userClass) {
        throw new BadRequestError(`Invalid User Type ${req.body.type}`)
    }
    return new userClass(req.body).create()
}

export const findUser = async(req) => {
    validateMongodbId(req.params.id)

}

class UserDTO {
    constructor({
                    identityCode,
                    firstName,
                    lastName,
                    email,
                    password,
                    homeTown,
                    birthdate,
                    details,
                    type,
                }) {
        this.identityCode = identityCode
        this.firstName = firstName
        this.lastName = lastName
        this.email = email
        this.password = password
        this.homeTown = homeTown
        this.birthdate = birthdate
        this.details = details
        this.type = type
    }

    async create(userId, session) {
        return await UserModel.create([{
            ...this,
            _id: userId
        }], {session: session})
    }

    async update(userId, payload, session) {
        return await userRepository.updateUserById({
            id: userId,
            payload,
            model: UserModel,
            session
        })
    }
}

class CollegeStudentDTO extends UserDTO {
    async create() {
        const session = await mongoose.startSession()
        session.startTransaction()
        try {
            const newCollegeStudent = await CollegeStudent.create([this.details], {session})
            const userCreated = await super.create(newCollegeStudent._id, session)
            await session.commitTransaction()
            return userCreated
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
        }
    }

    async update(id) {
        const session = await mongoose.startSession()
        session.startTransaction()
        const update = cleanData(this)
        try {
            if(update.details) {
                await userRepository.updateUserById({
                    id: id,
                    payload: parseNestedObj(update.details),
                    model: CollegeStudent,
                    session: session
                })
            }
            const baseInfoUpdated = await super.update(id, parseNestedObj(update), session)
            await session.commitTransaction()
            return baseInfoUpdated
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
        }

    }
}

class LecturerDTO extends UserDTO {
    async create() {
        const session = await mongoose.startSession()
        session.startTransaction()
        try {
            const newLecturer = await Lecturer.create([this.details], {session})
            const userCreated = await super.create(newLecturer._id, session)
            await session.commitTransaction()
            return userCreated
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
        }
    }
}


class CandidateDTO extends UserDTO {
    async create() {
        const session = await mongoose.startSession()
        session.startTransaction()
        try {
            const newCandidate = await Candidate.create([this.details], {session})
            const userCreated = await super.create(newCandidate._id, session)
            await session.commitTransaction()
            return userCreated
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
        }
    }
}

userClasses[1] = CollegeStudentDTO
userClasses[2] = LecturerDTO
userClasses[3] = CandidateDTO
