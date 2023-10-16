import Friendship from "../friendship.model.js";
import User, {unSelectUserFieldToPublic} from "../User.js";
import {BadRequestError} from "../../core/errors/badRequest.error.js";
import mongoose from "mongoose";
import {cleanData, getUnSelectObjFromSelectArr} from "../../utils/lodash.utils.js";
import {NotFoundError} from "../../core/errors/notFound.error.js";
import {UserModel, CollegeStudent, Lecturer} from "../user.model.js";

const respondFriendRequest = async ({friendShipId, receiverId, status}) => {
    // const session = await mongoose.startSession()
    // session.startTransaction()
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
        await existingFriendShip.save();
        if(status === 'Accepted') {
            const sender = existingFriendShip.sender
            const receiver = existingFriendShip.receiver
            if(receiver.friends.findIndex(f => f.equals(sender._id)) === -1) {
                receiver.friends.push(sender._id)
                receiver.friendCount++
                await receiver.save()
                // await receiver.save({session})
            }
            if(sender.friends.findIndex(f => f.equals(receiver._id)) === -1) {
                sender.friends.push(receiver._id)
                sender.friendCount++
                await sender.save()
                // await sender.save({session})
            }
        }

        // await session.commitTransaction()
        // await session.endSession()
        return "Request success";
    } catch(err) {
        // await session.abortTransaction()
        // await session.endSession()
        throw err
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

const getFriendsList = async ({userId, search = "", limit = 20, page = 1, select = []}) => {
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

const findById = async(id) => {
    const user = await UserModel.findById(id)
    return user.toPublicData()

}

const updateUser = async(id, payload) => {

}

const updateUserById = async({
    id,
    payload,
    model,
    returnNew = true,
    session
}) => {
    return await model.findByIdAndUpdate(id, payload, { new: returnNew, session: session })
}

export {
    sendFriendRequest, findUserById, findUserByEmail, respondFriendRequest, getFriendsList, getFriendRequests,
    findById, updateUserById
}

