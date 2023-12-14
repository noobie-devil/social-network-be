import * as userRepository from "../repositories/user.repo.js";
import {validateMongodbId} from "../utils/global.utils.js";
import {Candidate, CollegeStudent, Lecturer, User} from "../models/user.model.js"
import {NotFoundError} from "../core/errors/notFound.error.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {createUserSchema, respondFriendRequestSchema, updateUserSchema} from "../schemaValidate/user.schema.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import {cleanData, parseNestedObj} from "../utils/lodash.utils.js";
import {ValidationError} from "../core/errors/validation.error.js";
import {baseQuerySchema} from "../schemaValidate/query.schema.js";
import {updateSingleAssetResource, uploadAssetResource} from "./assetResource.service.js";

export const findById = async(req) => {
    validateMongodbId(req.params.id)
    return await userRepository.findById(req.params.id);
}

const uploadAvatar = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    // const user = await User.findById(req.user._id)
    const user = await userRepository.findById(req.user._id)
    if(user.avatar) {
        const assetId = user.avatar._id
        await updateSingleAssetResource({files: req.files, assetId})

        return await userRepository.findById(req.user._id)
    }
    const {resources} = await uploadAssetResource(req)
    if(resources && resources.length !== 0) {
        const avatar = resources[0]._id
        return await userRepository.uploadAvatar(user._id, avatar)
    } else {
        throw new BadRequestError()
    }
}

const removeAvatar = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    return await userRepository.removeAvatar(req.user._id)
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
    await baseQuerySchema.validateAsync(req.query)
    const userId = req.user._id
    return await userRepository.getFriendsList(userId,req.query)
}

export const getFriendRequests = async (req) => {
    if (!req.user) throw new InvalidCredentialsError()
    const {search, limit, page} = req.body
    const userId = req.user._id
    return await userRepository.getFriendRequests({userId, search, limit, page})
}

export const userUpdateProfile = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    req.body['type'] = req.user.type
    await updateUserSchema.validateAsync(req.body)
    const username = req.body.username
    if(!username && !username.trim().isEmpty()) {
        const existUserName = await User.findOne({
            _id: { $ne: req.user._id},
            username
        })
        if(existUserName) throw new ValidationError({
            message: "Username already exists",
            statusCode: 409
        })
    }
    return new userClasses[req.user.type](req.body).update(req.user._id)
}

export const updateUserById = async(req) => {
    const id = req.params.id
    const user = await findById(req)
    if(!user) throw new NotFoundError()
    req.body['type'] = user.type
    await updateUserSchema.validateAsync(req.body)
    const username = req.body.username
    if(!username && !username.trim().isEmpty()) {
        const existUserName = User.findOne({
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
    const {email} = req.body
    const emailExists = await User.findOne({email}).lean()
    if(emailExists) throw new ValidationError({
        message: 'This email is already been registered',
        statusCode: 409
    })
    return new userClass(req.body).create()
}

class UserDTO {
    constructor({
                    identityCode,
                    firstName,
                    lastName,
                    username,
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
        this.username = username || ""
        this.email = email
        this.password = password
        this.homeTown = homeTown
        this.birthdate = birthdate
        this.details = details
        this.type = type
    }

    async create(userId, session) {
        return await userRepository.create(
            User,
            {
                ...this,
                _id: userId
            },
            session
        )
    }

    async update(userId, payload, session) {
        return await userRepository.updateUserById({
            id: userId,
            payload,
            model: User,
            session
        })
    }
}

class CollegeStudentDTO extends UserDTO {
    async create() {
        const session = await mongoose.startSession()
        session.startTransaction()
        try {
            // const newCollegeStudent = await CollegeStudent.create([this.details], {session})
            const newCollegeStudent = await userRepository.create(
                CollegeStudent,
                this.details,
                session
            )
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
            // const newLecturer = await Lecturer.create([this.details], {session})
            const newLecturer = await userRepository.create(
                Lecturer,
                [this.details],
                session
            )
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
            // const newCandidate = await Candidate.create([this.details], {session})
            const newCandidate = await userRepository.create(
                Candidate,
                this.details,
                session
            )
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

export {
    uploadAvatar,
    removeAvatar
}
