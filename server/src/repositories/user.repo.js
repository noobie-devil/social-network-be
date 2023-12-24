import Friendship from "../models/friendship.model.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import {cleanData, getUnSelectObjFromSelectArr} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {User, CollegeStudent, Lecturer, Candidate} from "../models/user.model.js";
import {unSelectUserFieldToPublic} from "../utils/global.utils.js";
import ResourceStorage from "../models/resourceStorage.model.js";
import {deleteAssetResource, deleteAssetResourceWithRef} from "../services/assetResource.service.js";
import {adminFieldPopulated} from "../models/admin.model.js";

const respondFriendRequest = async ({friendShipId, receiverId, status}) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const existingFriendShip = await Friendship.findOne({
            _id: new mongoose.Types.ObjectId(friendShipId),
            receiver: new mongoose.Types.ObjectId(receiverId),
            status: "Pending"
        })
            .populate("sender receiver");
        if (!existingFriendShip) throw new BadRequestError("Invalid request");
        if(!existingFriendShip.sender || !existingFriendShip.receiver) {
            throw NotFoundError("An error occurred, the user does not exist")
        }
        existingFriendShip.status = status;
        await existingFriendShip.save({session});
        if(status === 'Accepted') {
            const sender = existingFriendShip.sender
            const receiver = existingFriendShip.receiver
            if(receiver.friends.findIndex(f => f.equals(sender._id)) === -1) {
                receiver.friends.push(sender._id)
                receiver.friendCount++
                await receiver.save({session})
            }
            if(sender.friends.findIndex(f => f.equals(receiver._id)) === -1) {
                sender.friends.push(receiver._id)
                sender.friendCount++
                await sender.save({session})
            }
        }

        await session.commitTransaction()
        return "Request success";
    } catch(err) {
        await session.abortTransaction()
        throw err
    } finally {
        await session.endSession()
    }
}

const sendFriendRequest = async ({senderId, receiverId}) => {
    const existingFriendship = await Friendship.findOne({
        $or: [{sender: senderId, receiver: receiverId}, {sender: receiverId, receiver: senderId}]
    });
    if (existingFriendship) {
        if (existingFriendship.status === 'Rejected') {
            existingFriendship.status = "Pending"
            await existingFriendship.save()
            return "Send request success";
        }
        throw new BadRequestError("Friendships existed")
    }

    const newFriendship = new Friendship({
        sender: new mongoose.Types.ObjectId(senderId),
        receiver: new mongoose.Types.ObjectId(receiverId),
        status: "Pending"
    });
    await newFriendship.save();
    return "Send request success";
}

const getFriendsList = async (userId, {search = "", limit = 20, page = 1, select = []}) => {
    const skip = (page - 1) * limit
    const extend = ["__v", "friends"]

    const query = User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "friends",
                foreignField: "_id",
                as: "friends",
            }
        },
        {
            $unwind: "$friends",
        },
        {
            $match: {
                'friends.lastName': { $regex: search, $options: "i"},
                'friends._id': {$ne: new mongoose.Types.ObjectId(userId)}
            }
        },
        {
            $group: {
                _id: '$_id',
                friends: { $push: '$friends'}
            }
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        {
            $project: {
                _id: 0,
                friends: unSelectUserFieldToPublic({ extend })
            }
        }
    ]);

    return await query.exec()
}

const getFriendRequests = async ({userId, search = "", limit = 20, page = 1, select = []}) => {
    const skip = (page - 1) * limit
    const extend = ["__v"]
    const query = Friendship
        .aggregate([
            {
                $match: {
                    receiver: new mongoose.Types.ObjectId(userId),
                    status: "Pending",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderInfo",
                },
            },
            {
                $unwind: "$senderInfo",
            },
            {
                $match: {
                    $or: [
                        { "senderInfo.lastName": { $regex: search, $options: "i" } },
                        { "senderInfo.lastName": { $exists: false } },
                    ],
                },
            },
            {
                $sort: { updatedAt: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    ...getUnSelectObjFromSelectArr(extend),
                    senderInfo: unSelectUserFieldToPublic({ extend })
                },
            },
        ]);

    return await query.exec();
}

const findUserByEmail = async ({email, select = {
        email: 1, password: 1, username: 1, status: 1
    }}) => {
    return await User.findOne({email}).select(select).exec()
}

const findByEmail = async(email) => {
    let user = await User.findOne({ email })
    if(!user) throw new NotFoundError()
    let populatePaths = []
    if(user.type === 3) {
        populatePaths.push({
            path: "registeredMajor",
                select: "code name"
        })
    }
    if(user.type === 2) {
        populatePaths.push({
            path: "major",
            select: "code name"
        },)
    }
    if(user.type === 1) {
        populatePaths.push(
            {
                path: "faculty",
                select: "code name"
            },
            {
                path: "major",
                select: "code name"
            },
            {
                path: "enrollmentYear",
                select: "name startYear"
            }
        )
    }
    if(user.details && user.type) {
        switch (user.type) {
            case 1:
                user.details = await CollegeStudent.findById(user._id)
                    .populate(populatePaths)
                    .select("_id")
                break
            case 2:
                user.details = await Lecturer.findById(user._id)
                    .populate(populatePaths)
                    .select("_id")
                break
            case 3:
                user.details = await Candidate.findById(user._id)
                    .populate(populatePaths)
                    .select("_id")
                break
        }
    }
    return user
}

const findById = async(id) => {
    const user = await User.findById(id)
    if(!user) throw new NotFoundError()
    return user.toPublicData()
}

const create = async (model, payload, session) => {
    console.log("create payload: " + payload)
    const user = await model.create([payload], {session, _id: false})
    if(model === User) {
        console.log(user)
        return user[0].toPublicData()
    }
    return user
}

const uploadAvatar = async(userId, avatar) => {
    const update = await User.findByIdAndUpdate(userId, { avatar }, { new: true})
    if(!update) throw new NotFoundError()
    return update.toPublicData()
}

const removeAvatar = async(userId) => {
    let user = await User.findById(userId)
    if(!user) throw new NotFoundError()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        if(user.avatar) {
            const resourceId = user.avatar._id
            await deleteAssetResourceWithRef({
                resources: [resourceId]
            })
            user.avatar = undefined
            user = await user.save({new: true, session})
            await session.commitTransaction()
            return user.toPublicData()
        } else {
            throw new BadRequestError()
        }
    } catch (err) {
        console.log(err)
        await session.abortTransaction()
        throw err
    } finally {
        await session.endSession()
    }

}

const updateUserById = async({
    id,
    payload,
    model,
    returnNew = true,
    session
}) => {
    const update = await model.findByIdAndUpdate(id, payload, { new: returnNew, session: session })
    if(model === User) {
        return update.toPublicData()
    }

    return update
}

export {
    sendFriendRequest, findUserByEmail, respondFriendRequest, getFriendsList, getFriendRequests,
    findById, updateUserById, create, findByEmail, uploadAvatar, removeAvatar
}


