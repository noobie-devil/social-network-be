import Friendship from "../models/friendship.model.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import {cleanData, getUnSelectObjFromSelectArr} from "../utils/lodash.utils.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {User, CollegeStudent, Lecturer} from "../models/user.model.js";
import {unSelectUserFieldToPublic} from "../utils/global.utils.js";

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

const findUserById = async (userId) => {
    return await User.findById(userId).exec();
}

const findUserByEmail = async ({email, select = {
        email: 1, password: 1, username: 1, status: 1
    }}) => {
    return await User.findOne({email}).select(select).exec()
}

const findByEmail = async(email) => {
    return await User.findOne({email})
        // .select(unSelectUserFieldToPublic({timestamps: true}))
        .exec()
}

const findById = async(id) => {
    const user = await User.findById(id)
    return user.toPublicData()

}

const create = async (model, payload, session) => {
    const user = await model.create([payload], {session})
    if(model === User) {
        return user.toPublicData()
    }
    return user
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
    sendFriendRequest, findUserById, findUserByEmail, respondFriendRequest, getFriendsList, getFriendRequests,
    findById, updateUserById, create, findByEmail
}


